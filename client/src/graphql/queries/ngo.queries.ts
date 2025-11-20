import { gql } from '@apollo/client';

export const MY_NGO_QUERY = gql`
  query MyNgo {
    myNgo {
      id
      name
      slug
      description
      logoUrl
      website
      contactEmail
      events {
        id
        title
        description
        date
        location
        tags
        imageUrl
        maxVolunteers
        signups {
          status
          user {
            id
            name
            email
            avatarUrl
          }
        }
      }
      badges {
        id
        name
        description
        imageUrl
        criteria
      }
      branches {
        id
        address
        city
        latitude
        longitude
      }
    }
  }
`;

export const GET_NGO_BY_SLUG_QUERY = gql`
  query GetNgoBySlug($slug: String!) {
    getNgoBySlug(slug: $slug) {
      id
      name
      slug
      description
      logoUrl
      website
      contactEmail
      events {
        id
        title
        date
        location
        tags
        imageUrl
      }
      badges {
        id
        name
        description
        imageUrl
      }
    }
  }
`;

export const GET_ALL_NGOS_QUERY = gql`
  query GetAllNgos {
    getAllNgos {
      id
      name
      slug
      description
      logoUrl
      website
      contactEmail
      events {
        id
        title
        description
        date
        location
        tags
        imageUrl
        maxVolunteers
      }
      badges {
        id
        name
        description
        imageUrl
        criteria
      }
      branches {
        id
        address
        city
        latitude
        longitude
      }
    }
  }
`;