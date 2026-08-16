import { useAppModal } from '@/contexts';
import { FootprintLocation } from '@/types';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useDb } from '../../providers/DatabaseProvider';
import { FootprintDraftRepository } from '../../repositories';
import { computeThumbhash } from '../../utils/thumbhash';

const DRAFT_SAVE_DEBOUNCE_MS = 600;

interface Params {
  enabled: boolean;
  draftIdParam?: string;
  tripId: string;
  title: string;
  content: string;
  date: string;
  locations: FootprintLocation[];
  weatherInfo: string;
  setTitle: (value: string) => void;
  setContent: (value: string) => void;
  setDate: (value: string) => void;
  setTripId: (value: string) => void;
  setWeatherInfo: (value: string) => void;
  setLocations: (value: FootprintLocation[]) => void;
  setPhotoUrls: (value: string[]) => void;
}

export function useFootprintDraftForm({
  enabled,
  draftIdParam,
  tripId,
  title,
  content,
  date,
  locations,
  weatherInfo,
  setTitle,
  setContent,
  setDate,
  setTripId,
  setWeatherInfo,
  setLocations,
  setPhotoUrls,
}: Params) {
  const db = useDb();
  const router = useRouter();
  const { showConfirm } = useAppModal();

  const [draftId] = useState(() => draftIdParam || Crypto.randomUUID());
  const [isExistingDraft, setIsExistingDraft] = useState(!!draftIdParam);
  const [isHydrating, setIsHydrating] = useState(!!draftIdParam);
  const isFinalizedRef = useRef(false);
  const isFinalized = () => isFinalizedRef.current;

  useEffect(() => {
    if (!draftIdParam) {
      setIsHydrating(false);
      return;
    }

    const draftRepo = new FootprintDraftRepository(db);
    draftRepo.getById(draftIdParam).then(async (draft) => {
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
        setDate(draft.date);
        setTripId(draft.tripId);
        setWeatherInfo(draft.weatherInfo || '');
        setLocations(draft.locations);
        const photos = await draftRepo.getPhotos(draft.id);
        setPhotoUrls(photos.map((p) => p.localUri));
      } else {
        setIsExistingDraft(false);
      }
      setIsHydrating(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftIdParam, db]);

  useEffect(() => {
    if (!enabled || isHydrating) return;
    if (!title.trim() && !content.trim() && !weatherInfo.trim() && locations.length === 0) return;

    const timeout = setTimeout(() => {
      if (isFinalized()) return;
      new FootprintDraftRepository(db).save(draftId, tripId, {
        title: title.trim(),
        content: content.trim(),
        date,
        locations,
        weatherInfo: weatherInfo.trim() || undefined,
      });
    }, DRAFT_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [enabled, isHydrating, draftId, db, tripId, title, content, date, locations, weatherInfo]);

  const persistPhotoAdd = async (uris: string[], startIndex: number) => {
    if (!enabled || isFinalized()) return;
    const draftRepo = new FootprintDraftRepository(db);
    await draftRepo.save(draftId, tripId, {
      title: title.trim(),
      content: content.trim(),
      date,
      locations,
      weatherInfo: weatherInfo.trim() || undefined,
    });
    for (const [i, uri] of uris.entries()) {
      const thumbhash = await computeThumbhash(uri);
      await draftRepo.addPhoto(draftId, uri, startIndex + i, thumbhash);
    }
  };

  const persistPhotoRemove = (uri: string) => {
    if (!enabled) return;
    new FootprintDraftRepository(db).removePhotoByUri(draftId, uri);
  };

  const markFinalized = () => {
    isFinalizedRef.current = true;
  };

  const deleteDraft = async () => {
    markFinalized();
    await new FootprintDraftRepository(db).delete(draftId);
  };

  const handleDeleteDraft = async () => {
    const confirmed = await showConfirm('초안 삭제', '작성 중인 내용을 삭제하시겠습니까?', {
      confirmText: '삭제',
      cancelText: '취소',
      destructive: true,
    });
    if (!confirmed) return;
    await deleteDraft();
    router.back();
  };

  return {
    draftId,
    isHydrating,
    isExistingDraft,
    markFinalized,
    deleteDraft,
    handleDeleteDraft,
    persistPhotoAdd,
    persistPhotoRemove,
  };
}
