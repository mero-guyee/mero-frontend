import React from 'react';
import { type YStackProps, Text, YStack } from 'tamagui';
import { FilledButton } from './button/BaseButton';

interface EmptyStateProps extends YStackProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, description, action, ...stackProps }: EmptyStateProps) {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingVertical="$16"
      gap="$4"
      {...stackProps}
    >
      {icon && <>{icon}</>}

      <YStack alignItems="center" gap="$1">
        <Text fontSize={16} fontWeight="600" color="$foreground">
          {title}
        </Text>
        {description && (
          <Text fontSize={13} color="$mutedForeground" textAlign="center" paddingHorizontal="$6">
            {description}
          </Text>
        )}
      </YStack>
      {action && (
        <FilledButton
          marginTop="$2"
          backgroundColor="$accentStrong"
          pressStyle={{ opacity: 0.8 }}
          paddingHorizontal="$5"
          paddingVertical="$3"
          onPress={action.onPress}
        >
          <Text color="white" fontWeight="500">
            {action.label}
          </Text>
        </FilledButton>
      )}
    </YStack>
  );
}
