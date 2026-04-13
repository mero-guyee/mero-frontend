import type { TabsContentProps } from 'tamagui';

import { H5, Tabs, Text, useWindowDimensions } from 'tamagui';

const HorizontalTabs = () => {
  const { width } = useWindowDimensions();
  return (
    <Tabs
      defaultValue="tab1"
      orientation="horizontal"
      flexDirection="column"
      width={400}
      height={150}
      borderWidth="$0.25"
      borderColor="$borderColor"
    >
      <Tabs.List aria-label="Manage your account">
        <Tabs.Tab
          activeStyle={{
            backgroundColor: '$color3',
          }}
          flex={1}
          value="tab1"
        >
          <Text>Profile</Text>
        </Tabs.Tab>
        <Tabs.Tab
          activeStyle={{
            backgroundColor: '$color3',
          }}
          flex={1}
          value="tab2"
        >
          <Text>Connections</Text>
        </Tabs.Tab>
        <Tabs.Tab
          activeStyle={{
            backgroundColor: '$color3',
          }}
          flex={1}
          value="tab3"
        >
          <Text>Notifications</Text>
        </Tabs.Tab>
      </Tabs.List>
      <TabsContent value="tab1">
        <H5>Profile</H5>
      </TabsContent>

      <TabsContent value="tab2">
        <H5>Connections</H5>
      </TabsContent>

      <TabsContent value="tab3">
        <H5>Notifications</H5>
      </TabsContent>
    </Tabs>
  );
};

const TabsContent = (props: TabsContentProps) => {
  return (
    <Tabs.Content
      bg="$background"
      key="tab3"
      p="$2"
      items="center"
      justify="center"
      flex={1}
      borderColor="$background"
      rounded="$2"
      borderTopLeftRadius={0}
      borderTopRightRadius={0}
      borderWidth="$2"
      {...props}
    >
      {props.children}
    </Tabs.Content>
  );
};
