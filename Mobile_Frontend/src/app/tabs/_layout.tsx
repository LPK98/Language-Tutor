import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { BottomNavigation, NavButton } from '@/components/BottomNavigation';

export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <BottomNavigation>
          <TabTrigger name="home" href="/tabs/home" asChild>
            <NavButton icon="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="lessons" href="/tabs/lessons" asChild>
            <NavButton icon="lessons" label="Lessons" />
          </TabTrigger>
          <TabTrigger name="practice" href="/tabs/practice" asChild>
            <NavButton icon="practice" label="Practice" />
          </TabTrigger>
          <TabTrigger name="profile" href="/tabs/profile" asChild>
            <NavButton icon="profile" label="Profile" />
          </TabTrigger>
        </BottomNavigation>
      </TabList>
    </Tabs>
  );
}
