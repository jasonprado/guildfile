import { describe, expect, it } from 'vitest';
import { APIGuildChannel, ChannelType } from 'discord-api-types/v10';
import { buildChannelPlan } from './channels';
import { ChannelSpec } from '../types';

const baseActual: APIGuildChannel[] = [
  {
    id: '100',
    type: ChannelType.GuildCategory,
    name: 'Community',
    position: 0,
    permission_overwrites: [],
  } as APIGuildChannel,
  {
    id: '200',
    type: ChannelType.GuildText,
    name: 'general',
    position: 0,
    parent_id: '100',
    permission_overwrites: [],
  } as APIGuildChannel,
];

const specs: ChannelSpec[] = [
  {
    key: 'community',
    id: '100',
    name: 'Community',
    type: 'GuildCategory',
    position: 0,
  },
  {
    key: 'general',
    id: '200',
    name: 'general',
    type: 'GuildText',
    parent: 'community',
  },
];

describe('buildChannelPlan', () => {
  it('flags missing channels as creates', () => {
    const plan = buildChannelPlan(
      [
        ...specs,
        {
          key: 'updates',
          name: 'updates',
          type: 'GuildText',
          parent: 'community',
        },
      ],
      baseActual
    );

    expect(plan.creates.map((c) => c.key)).toContain('updates');
  });

  it('detects updates when a property changes', () => {
    const plan = buildChannelPlan(
      [
        specs[0],
        {
          ...specs[1],
          topic: 'New topic',
        },
      ],
      baseActual
    );

    expect(plan.updates).toHaveLength(1);
    expect(plan.updates[0]?.spec.key).toBe('general');
  });

  it('identifies unmatched discord channels', () => {
    const plan = buildChannelPlan(specs, [
      ...baseActual,
      {
        id: '300',
        type: ChannelType.GuildText,
        name: 'random',
        position: 1,
        permission_overwrites: [],
      } as APIGuildChannel,
    ]);

    expect(plan.unmatchedActual).toHaveLength(1);
    expect(plan.unmatchedActual[0]?.id).toBe('300');
  });
});
