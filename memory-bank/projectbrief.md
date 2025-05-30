# Scrum Poker Project Brief

## Application Overview
Scrum Poker is a collaborative estimation tool for agile teams to anonymously vote on task complexity using a modified Fibonacci scale. This web-based implementation focuses on real-time interaction with minimal setup.

## Core Requirements
1. Real-time collaborative voting system
2. Simplified participant roles (all users can moderate)
3. WebSocket-based synchronization
4. Pseudonym-based identification (UUID + localStorage)
5. Voting scale: 0.5, 1, 2, 3, 5, 8, 13, 21, ?

## Voting Flow
1. Participants submit hidden votes
2. UI shows who has voted (without revealing votes)
3. Moderator clicks "Reveal votes" to show all estimates
4. System displays:
   - All individual votes
   - Average (rounded to 1 decimal place)
   - Median of non-empty votes

## Room Controls
1. New Voting - Creates new voting session: resets estimates and sets votes to unrevealed
3. Reveal Votes - Shows all submitted estimates

## User Stories
- As a participant, I want to join a room with a simple code
- As a participant, I want to submit/change my hidden estimate
- As a participant, I want to see who has voted
- As a participant, I want to see vote statistics (avg/median)
- As a moderator, I want to reveal all votes
- As a moderator, I want to create new voting session

## Success Metrics
- Sub-100ms vote synchronization latency
- Zero-configuration room joining
- Mobile-first responsive design
