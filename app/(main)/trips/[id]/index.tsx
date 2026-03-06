import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  File,
  FileText,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Upload,
  X,
} from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Image, Text, XStack, YStack } from 'tamagui';
import { useFootprints, useExpenses, useTrips } from '../../../../contexts';

type SubTab = 'memos' | 'files';

interface SelectedFile {
  name: string;
  size: number;
  uri: string;
}

export default function TripHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getTripById, getMemosByTripId, deleteTrip, deleteMemo } = useTrips();
  const { getFootprintsByTripId } = useFootprints();
  const { getExpensesByTripId } = useExpenses();

  const trip = getTripById(id || '');
  const footprints = getFootprintsByTripId(id || '');
  const expenses = getExpensesByTripId(id || '');
  const memos = getMemosByTripId(id || '');

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [subTab, setSubTab] = useState<SubTab>('memos');

  if (!trip) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">여행을 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    setShowMenu(false);
    router.push(`/trips/${id}/edit`);
  };

  const handleDelete = () => {
    Alert.alert(
      '여행 삭제',
      '이 여행과 관련된 모든 일기와 경비가 삭제됩니다. 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteTrip(id || '');
            router.replace('/trips');
          },
        },
      ]
    );
  };

  const handleCreateNote = () => {
    router.push({
      pathname: '/trips/note-form',
      params: { tripId: id },
    });
  };

  const handleEditNote = (memoId: string) => {
    router.push({
      pathname: '/trips/note-form',
      params: { tripId: id, memoId },
    });
  };

  const handleDeleteNote = (memoId: string) => {
    Alert.alert('메모 삭제', '이 메모를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMemo(memoId),
      },
    ]);
  };

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles: SelectedFile[] = result.assets.map((asset) => ({
          name: asset.name,
          size: asset.size || 0,
          uri: asset.uri,
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);
      }
    } catch (error) {
      console.error('File selection error:', error);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const getTimeText = (dateString: string) => {
    const createdDate = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff === 0) return '오늘';
    if (daysDiff === 1) return '어제';
    return `${daysDiff}일 전`;
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* App Bar */}
      <XStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <Button
          size="$4"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: '$accent' }}
          onPress={handleBack}
        >
          <ArrowLeft size={20} color="$foreground" />
        </Button>
        <Text flex={1} textAlign="center" color="$foreground" fontSize={16} fontWeight="500">
          {trip.title}
        </Text>
        <YStack position="relative">
          <Button
            size="$4"
            circular
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: '$accent' }}
            onPress={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} color="$foreground" />
          </Button>
          {showMenu && (
            <YStack
              position="absolute"
              top={44}
              right={0}
              width={180}
              backgroundColor="$card"
              borderRadius="$4"
              overflow="hidden"
              zIndex={100}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Pressable onPress={handleEdit}>
                <XStack padding="$3" hoverStyle={{ backgroundColor: '$accent' }}>
                  <Text color="$foreground">수정</Text>
                </XStack>
              </Pressable>
              <Pressable onPress={() => { setShowMenu(false); handleDelete(); }}>
                <XStack padding="$3" hoverStyle={{ backgroundColor: '$destructive' }}>
                  <Text color="$destructive">삭제</Text>
                </XStack>
              </Pressable>
            </YStack>
          )}
        </YStack>
      </XStack>

      <ScrollView style={{ flex: 1 }}>
        {/* Cover Image */}
        <YStack height={192} position="relative" overflow="hidden">
          <Image
            source={{ uri: trip.imageUrl }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            top={0}
            style={{
              background: 'linear-gradient(to top, rgba(92, 64, 51, 0.5), transparent)',
            }}
          />
          <YStack position="absolute" bottom={16} left={16} right={16}>
            <XStack alignItems="center" gap="$2" marginBottom="$1">
              <Calendar size={16} color="white" />
              <Text color="white" fontSize={14} opacity={0.9}>
                {trip.startDate} - {trip.endDate}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$1">
              <MapPin size={16} color="white" />
              <Text color="white" fontSize={14} opacity={0.9}>
                {trip.countries.join(', ')}
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Sub Tab Navigation */}
        <YStack paddingTop="$4" paddingHorizontal="$5">
          <XStack
            backgroundColor="$card"
            padding="$1"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$border"
          >
            <Button
              flex={1}
              height={40}
              borderRadius="$3"
              backgroundColor={subTab === 'memos' ? '$accent' : 'transparent'}
              pressStyle={{ backgroundColor: subTab === 'memos' ? '$accent' : '$muted' }}
              onPress={() => setSubTab('memos')}
            >
              <Text
                color={subTab === 'memos' ? '$foreground' : '$mutedForeground'}
                fontSize={14}
                fontWeight="500"
              >
                📝 메모
              </Text>
            </Button>
            <Button
              flex={1}
              height={40}
              borderRadius="$3"
              backgroundColor={subTab === 'files' ? '$accent' : 'transparent'}
              pressStyle={{ backgroundColor: subTab === 'files' ? '$accent' : '$muted' }}
              onPress={() => setSubTab('files')}
            >
              <Text
                color={subTab === 'files' ? '$foreground' : '$mutedForeground'}
                fontSize={14}
                fontWeight="500"
              >
                📂 서류
              </Text>
            </Button>
          </XStack>
        </YStack>

        {/* Content Area */}
        <YStack padding="$5" paddingTop="$4">
          {subTab === 'memos' ? (
            // Notes Section
            <YStack gap="$3">
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$1">
                <Text color="$foreground" fontSize={14}>
                  {memos.length > 0 ? `총 ${memos.length}개의 메모` : '메모'}
                </Text>
                <Pressable onPress={handleCreateNote}>
                  <Text color="$primary" fontSize={14}>
                    + 새 메모
                  </Text>
                </Pressable>
              </XStack>

              {memos.length === 0 ? (
                <YStack
                  backgroundColor="$card"
                  borderRadius="$6"
                  padding="$8"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$border"
                >
                  <YStack
                    width={64}
                    height={64}
                    backgroundColor="$accent"
                    borderRadius="$4"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="$3"
                    opacity={0.3}
                  >
                    <BookOpen size={32} color="$primary" />
                  </YStack>
                  <Text color="$mutedForeground" fontSize={14} marginBottom="$3">
                    자유롭게 메모하세요
                  </Text>
                  <Button
                    backgroundColor="$accent"
                    pressStyle={{ backgroundColor: '$accentHover' }}
                    borderRadius="$4"
                    paddingHorizontal="$6"
                    paddingVertical="$3"
                    onPress={handleCreateNote}
                  >
                    <XStack alignItems="center" gap="$2">
                      <Pencil size={16} color="$foreground" />
                      <Text color="$foreground" fontWeight="500">
                        첫 노트 작성하기
                      </Text>
                    </XStack>
                  </Button>
                </YStack>
              ) : (
                <YStack gap="$2">
                  {memos.map((note) => (
                    <Pressable key={note.id} onPress={() => handleEditNote(note.id)}>
                      <YStack
                        backgroundColor="$card"
                        borderRadius="$6"
                        padding="$4"
                        borderWidth={1}
                        borderColor="$border"
                      >
                        <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$2">
                          <Text color="$foreground" fontWeight="500" flex={1} paddingRight="$2">
                            {note.title}
                          </Text>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            style={{ padding: 8, marginRight: -8, marginTop: -8 }}
                          >
                            <Trash2 size={16} color="$destructive" />
                          </Pressable>
                        </XStack>
                        <Text
                          color="$mutedForeground"
                          fontSize={14}
                          numberOfLines={2}
                          marginBottom="$2"
                        >
                          {note.content}
                        </Text>
                      </YStack>
                    </Pressable>
                  ))}
                </YStack>
              )}
            </YStack>
          ) : (
            // Files Section
            <YStack gap="$6">
              {/* File Upload */}
              <YStack>
                <Text color="$foreground" fontSize={14} marginBottom="$3">
                  파일 업로드
                </Text>

                <Pressable onPress={handleFileSelect}>
                  <YStack
                    borderWidth={2}
                    borderStyle="dashed"
                    borderColor="$primary"
                    borderRadius="$6"
                    padding="$8"
                    alignItems="center"
                    backgroundColor="$card"
                    opacity={0.4}
                  >
                    <YStack
                      width={48}
                      height={48}
                      backgroundColor="$accent"
                      borderRadius="$4"
                      alignItems="center"
                      justifyContent="center"
                      marginBottom="$3"
                      opacity={0.3}
                    >
                      <Upload size={24} color="$primary" />
                    </YStack>
                    <Text color="$mutedForeground" fontSize={14}>
                      PDF, JPG, PNG 파일 (10MB 이하)
                    </Text>
                    <YStack marginTop="$3">
                      <YStack
                        backgroundColor="$accent"
                        paddingHorizontal="$6"
                        paddingVertical="$2.5"
                        borderRadius="$4"
                      >
                        <Text color="$foreground">파일 선택</Text>
                      </YStack>
                    </YStack>
                  </YStack>
                </Pressable>

                {selectedFiles.length > 0 && (
                  <YStack marginTop="$4" gap="$2">
                    <Text color="$foreground" fontSize={14} marginBottom="$2">
                      선택된 파일 ({selectedFiles.length})
                    </Text>
                    {selectedFiles.map((file, index) => (
                      <XStack
                        key={index}
                        backgroundColor="$card"
                        borderRadius="$4"
                        padding="$3"
                        alignItems="center"
                        justifyContent="space-between"
                        borderWidth={1}
                        borderColor="$border"
                      >
                        <XStack alignItems="center" gap="$3" flex={1}>
                          <YStack
                            width={40}
                            height={40}
                            backgroundColor="$accent"
                            borderRadius="$3"
                            alignItems="center"
                            justifyContent="center"
                            opacity={0.4}
                          >
                            <File size={20} color="$foreground" />
                          </YStack>
                          <YStack flex={1}>
                            <Text color="$foreground" fontSize={14} numberOfLines={1}>
                              {file.name}
                            </Text>
                            <Text color="$mutedForeground" fontSize={12}>
                              {(file.size / 1024).toFixed(1)} KB
                            </Text>
                          </YStack>
                        </XStack>
                        <Pressable onPress={() => removeFile(index)} style={{ padding: 8 }}>
                          <X size={16} color="$destructive" />
                        </Pressable>
                      </XStack>
                    ))}

                    <Button
                      marginTop="$3"
                      backgroundColor="$accent"
                      pressStyle={{ backgroundColor: '$accentHover' }}
                      borderRadius="$4"
                      height={48}
                    >
                      <Text color="$foreground" fontWeight="500">
                        업로드
                      </Text>
                    </Button>
                  </YStack>
                )}
              </YStack>

              {/* Saved Files */}
              <YStack>
                <Text color="$foreground" fontSize={14} marginBottom="$3">
                  저장된 파일
                </Text>
                <YStack
                  backgroundColor="$card"
                  borderRadius="$6"
                  padding="$4"
                  gap="$2"
                  borderWidth={1}
                  borderColor="$border"
                >
                  {footprints.length === 0 ? (
                    <Text textAlign="center" color="$mutedForeground" paddingVertical="$4">
                      아직 저장된 파일이 없습니다
                    </Text>
                  ) : (
                    <>
                      <XStack
                        backgroundColor="$muted"
                        borderRadius="$4"
                        padding="$3"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <XStack alignItems="center" gap="$3">
                          <YStack
                            width={40}
                            height={40}
                            backgroundColor="$primary"
                            borderRadius="$4"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <FileText size={20} color="white" />
                          </YStack>
                          <Text color="$foreground">[비행기]인천-산티아고_민경.pdf</Text>
                        </XStack>
                        <Pressable style={{ padding: 8 }}>
                          <Download size={20} color="$foreground" />
                        </Pressable>
                      </XStack>
                      <XStack
                        backgroundColor="$muted"
                        borderRadius="$4"
                        padding="$3"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <XStack alignItems="center" gap="$3">
                          <YStack
                            width={40}
                            height={40}
                            backgroundColor="$primary"
                            borderRadius="$4"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <FileText size={20} color="white" />
                          </YStack>
                          <Text color="$foreground">[비행기]인천-산티아고_지수.pdf</Text>
                        </XStack>
                        <Pressable style={{ padding: 8 }}>
                          <Download size={20} color="$foreground" />
                        </Pressable>
                      </XStack>
                    </>
                  )}
                </YStack>
              </YStack>
            </YStack>
          )}
        </YStack>

        {/* Bottom padding for tab bar */}
        <YStack height={100} />
      </ScrollView>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
          }}
          onPress={() => setShowMenu(false)}
        />
      )}
    </YStack>
  );
}
