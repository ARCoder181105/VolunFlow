import { gql } from '@apollo/client';

export const CREATE_BADGE_TEMPLATE_MUTATION = gql`
  mutation CreateBadgeTemplate($input: CreateBadgeInput!) {
    createBadgeTemplate(input: $input) {
      id
      name
      description
      imageUrl
      criteria
    }
  }
`;

export const AWARD_BADGE_MUTATION = gql`
  mutation AwardBadge($userId: ID!, $badgeId: ID!) {
    awardBadge(userId: $userId, badgeId: $badgeId) {
      id
      awardedAt
      badge {
        id
        name
        description
      }
      user {
        id
        name
        email
      }
    }
  }
`;