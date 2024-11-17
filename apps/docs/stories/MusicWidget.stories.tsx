import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { ListenUI } from 'ui';

const { MusicWidget } = ListenUI.Minimalism;

const audioList = [
  {
    src: 'https://res.cloudinary.com/shinabr2/video/upload/v1667828415/Public/Music/Japanese/Attack-on-Titan-Opening-1-Feuerroter-Pfeil-und-Bogen-Full-128-Linked-Horizon_1.mp3',
    name: 'Guren No Yumiya',
    artistName: 'Linked Horizon',
    image:
      'https://res.cloudinary.com/shinabr2/image/upload/v1667828561/Public/Images/artworks-000141088556-xy2nav-t500x500.jpg',
  },
  {
    src: 'https://res.cloudinary.com/shinabr2/video/upload/v1667831555/Public/Music/Japanese/Shinzou_wo_Sasageyo__-_Linked_Horizon.mp3',
    name: 'Shinzo wo Sasageyo',
    artistName: 'Linked Horizon',
    image:
      'https://res.cloudinary.com/shinabr2/image/upload/v1667828561/Public/Images/artworks-000141088556-xy2nav-t500x500.jpg',
  },
];

export default {
  title: 'Music widget',
  component: MusicWidget,
  // argTypes: {
  //   audioList: any[],
  // },
} as ComponentMeta<typeof MusicWidget>;

const Template: ComponentStory<typeof MusicWidget> = args => (
  <MusicWidget {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  audioList,
};
