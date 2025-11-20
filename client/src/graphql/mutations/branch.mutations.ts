import { gql } from '@apollo/client';

export const ADD_BRANCH_MUTATION = gql`
  mutation AddBranch($input: CreateBranchInput!) {
    addBranch(input: $input) {
      id
      address
      city
      latitude
      longitude
    }
  }
`;

export const DELETE_BRANCH_MUTATION = gql`
  mutation DeleteBranch($branchId: ID!) {
    deleteBranch(branchId: $branchId)
  }
`;