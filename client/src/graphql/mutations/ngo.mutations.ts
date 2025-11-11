import { gql } from '@apollo/client';

export const CREATE_NGO_MUTATION = gql`
  mutation CreateNgo($input: CreateNgoInput!) {
    createNgo(input: $input) {
      id
      name
      slug
      description
      contactEmail
    }
  }
`;

export const UPDATE_NGO_MUTATION = gql`
  mutation UpdateNgoProfile($input: UpdateNgoInput!) {
    updateNgoProfile(input: $input) {
      id
      name
      slug
      description
      logoUrl
      website
      contactEmail
    }
  }
`;