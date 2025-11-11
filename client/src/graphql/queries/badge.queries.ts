import { gql } from '@apollo/client';

export const GET_NGO_BADGES_QUERY = gql`
  query GetNgoBadges($ngoId: ID!) {
    getNgoBadges(ngoId: $ngoId) {
      id
      name
      description
      imageUrl
      criteria
    }
  }
`;