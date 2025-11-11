import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      avatarUrl
      role
    }
  }
`;

export const MY_PROFILE_QUERY = gql`
  query MyProfile {
    myProfile {
      id
      email
      name
      avatarUrl
      role
      signups {
        id
        status
        event {
          id
          title
          date
          location
        }
      }
      earnedBadges {
        id
        awardedAt
        badge {
          id
          name
          description
          imageUrl
        }
      }
    }
  }
`;