# Style Squad Implementation Guide

## ✅ Completed (Backend + Types)

### Backend (Railway) ✅
- **`style_squad.py`**: Complete squad management logic
- **10 API Endpoints**: All CRUD operations for squads, outfits, votes, messages
- **Database**: JSON-based storage (`style_squads_db.json`)
- **Features**: Create/join squads, share outfits, vote (👍/👎/🔥), group chat

### Frontend Types ✅
- **Type Definitions**: All TypeScript interfaces for Squad, SquadOutfit, Votes, Messages
- **Constants**: Added `SQUAD` mode to APP_MODES

## 🚧 TODO: Frontend Components

### Phase 1: Core Components (Essential)

#### 1. **Style Squad API Service** (`src/services/squadApi.ts`)
```typescript
export const squadApi = {
  // Squad Management
  createSquad: (data: CreateSquadRequest) => POST('/api/squad/create', data),
  joinSquad: (data: JoinSquadRequest) => POST('/api/squad/join', data),
  getSquad: (squadId: string) => GET(`/api/squad/${squadId}`),
  getUserSquads: (userId: string) => GET(`/api/squad/user/${userId}`),
  leaveSquad: (squadId: string, userId: string) => POST(`/api/squad/${squadId}/leave`, { userId }),
  deleteSquad: (squadId: string, userId: string) => DELETE(`/api/squad/${squadId}/delete`, { userId }),

  // Outfit Sharing
  shareOutfit: (data: ShareOutfitRequest) => POST(`/api/squad/${data.squadId}/outfit`, data),
  getSquadOutfits: (squadId: string, limit?: number) => GET(`/api/squad/${squadId}/outfits?limit=${limit || 20}`),

  // Voting & Chat
  voteOnOutfit: (data: VoteOnOutfitRequest) => POST(`/api/squad/outfit/${data.outfitId}/vote`, data),
  sendMessage: (data: SendMessageRequest) => POST(`/api/squad/outfit/${data.outfitId}/message`, data),
};
```

#### 2. **Squad Store** (`src/store/squadStore.ts`)
```typescript
interface SquadState {
  squads: Squad[];
  activeSquad: Squad | null;
  isLoading: boolean;

  // Actions
  setSquads: (squads: Squad[]) => void;
  setActiveSquad: (squad: Squad | null) => void;
  addSquad: (squad: Squad) => void;
  updateSquad: (squadId: string, updates: Partial<Squad>) => void;
  removeSquad: (squadId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set) => ({
      squads: [],
      activeSquad: null,
      isLoading: false,

      setSquads: (squads) => set({ squads }),
      setActiveSquad: (squad) => set({ activeSquad: squad }),
      addSquad: (squad) => set((state) => ({ squads: [...state.squads, squad] })),
      updateSquad: (squadId, updates) => set((state) => ({
        squads: state.squads.map(s => s.id === squadId ? { ...s, ...updates } : s)
      })),
      removeSquad: (squadId) => set((state) => ({
        squads: state.squads.filter(s => s.id !== squadId)
      })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'squad-storage' }
  )
);
```

#### 3. **Squad List Component** (`src/components/StyleSquad/SquadList.tsx`)
- Display all user's squads
- Create new squad button
- Join squad with invite code
- Squad cards showing:
  - Squad name + description
  - Member count (e.g., "5/10 members")
  - Latest outfit preview
  - Unread count badge

#### 4. **Squad Detail Component** (`src/components/StyleSquad/SquadDetail.tsx`)
- Selected squad view
- Tab navigation: Feed | Members | Settings
- **Feed Tab**: Show all shared outfits
- **Members Tab**: List members, show invite code
- **Settings Tab**: Leave/Delete squad

#### 5. **Outfit Feed Component** (`src/components/StyleSquad/OutfitFeed.tsx`)
- Display squad outfits in timeline
- Each outfit card shows:
  - User photo + name
  - Outfit image
  - Question/caption
  - Vote counts (👍 X | 👎 Y | 🔥 Z)
  - Comment count
  - Time ago

#### 6. **Outfit Card Component** (`src/components/StyleSquad/OutfitCard.tsx`)
- Outfit image (full-size, clickable)
- User info header
- Voting buttons: 👍 / 👎 / 🔥 (highlighted if user voted)
- Show vote breakdown
- Comments section
- Add comment input

#### 7. **Share Outfit Modal** (`src/components/StyleSquad/ShareOutfitModal.tsx`)
- Select squad dropdown
- Occasion selector
- Question/caption input: "Should I wear this to...?"
- Preview outfit image
- Share button

#### 8. **Create Squad Modal** (`src/components/StyleSquad/CreateSquadModal.tsx`)
- Squad name input
- Description textarea
- Max members selector (5-10)
- Create button
- Show invite code after creation

#### 9. **Join Squad Modal** (`src/components/StyleSquad/JoinSquadModal.tsx`)
- Invite code input
- Join button
- Success/error messages

### Phase 2: Enhanced Features (Nice-to-Have)

#### 10. **Vote Analytics** (`src/components/StyleSquad/VoteStats.tsx`)
- Show vote percentage breakdown
- "Squad's Favorite" badge (most 🔥 votes)
- User vote indicators

#### 11. **Member Management** (`src/components/StyleSquad/MemberList.tsx`)
- Show all members
- Creator badge
- Join date
- Remove member (creator only)

#### 12. **Real-time Updates** (Optional - Advanced)
- WebSocket or polling for live updates
- New outfit notifications
- New vote notifications
- New message notifications

### Phase 3: Integration

#### 13. **Update Header** (`src/components/Layout/Header.tsx`)
- Add "Style Squad" button/icon
- Show badge with unread count
- Link to Squad mode

#### 14. **Update App** (`src/App.tsx`)
- Add Squad route/mode
- Render StyleSquad component when mode === 'squad'

#### 15. **Share from Rater/Generator**
- Add "Share to Squad" button
- Open ShareOutfitModal with current image
- Quick share to favorite squad

## 📱 Component Structure

```
src/components/StyleSquad/
├── StyleSquad.tsx              # Main container
├── SquadList.tsx               # List of all squads
├── SquadCard.tsx               # Individual squad preview
├── SquadDetail.tsx             # Squad detail view
├── OutfitFeed.tsx              # Timeline of outfits
├── OutfitCard.tsx              # Single outfit with votes
├── ShareOutfitModal.tsx        # Share outfit dialog
├── CreateSquadModal.tsx        # Create squad dialog
├── JoinSquadModal.tsx          # Join squad dialog
├── VoteButtons.tsx             # Vote UI (👍/👎/🔥)
├── CommentSection.tsx          # Comments list + input
└── StyleSquad.module.css       # Styles
```

## 🎨 UI/UX Design Decisions

### Color Scheme
- **Primary**: Purple gradient (#667eea → #764ba2)
- **Success** (👍): Green (#10b981)
- **Fire** (🔥): Orange/Red gradient
- **Neutral** (👎): Gray (#6b7280)

### Animations
- Slide-in for new outfits
- Bounce on vote
- Confetti on first 🔥 vote
- Pulse for unread notifications

### Mobile Responsive
- Swipeable outfit cards
- Bottom sheet modals
- Floating action button for share

## 🚀 Quick Implementation Steps

1. **Create API service** (`squadApi.ts`) - 30 min
2. **Create Zustand store** (`squadStore.ts`) - 20 min
3. **Build core components** (SquadList, SquadDetail, OutfitFeed) - 2 hours
4. **Build modals** (Create, Join, Share) - 1 hour
5. **Add voting UI** (VoteButtons, vote logic) - 1 hour
6. **Add comments** (CommentSection) - 1 hour
7. **Integrate with app** (Header, routing) - 30 min
8. **Styling & polish** - 1 hour

**Total**: ~7-8 hours for MVP

## 📊 User Flow

```
1. User clicks "Style Squad" in header
   ↓
2. Sees list of their squads + "Create Squad" button
   ↓
3. Clicks squad → Opens SquadDetail
   ↓
4. Sees feed of outfits from squad members
   ↓
5. Clicks outfit → Opens full view with votes/comments
   ↓
6. Votes 👍/👎/🔥 → Vote recorded, UI updates
   ↓
7. Adds comment → Comment appears instantly
   ↓
8. Clicks "Share Outfit" → Opens modal
   ↓
9. Uploads photo, adds question, shares
   ↓
10. Squad members see outfit, vote, comment
```

## 🎯 Success Metrics

- **Engagement**: Average votes per outfit
- **Activity**: Outfits shared per week
- **Social**: Average comments per outfit
- **Retention**: Weekly active squads
- **Growth**: New squads created per week

## 🔒 Privacy & Safety

- Squads are private (invite-only)
- No public discovery
- Creator can delete squad
- Members can leave anytime
- Invite codes can be regenerated

## 📝 Next Steps

1. Review this document
2. Confirm design approach
3. Start with API service + store
4. Build components incrementally
5. Test each feature
6. Deploy to staging
7. User testing
8. Production deployment

---

**Status**: Backend ✅ | Frontend Types ✅ | UI Components ⏳
