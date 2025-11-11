import { gql } from '@apollo/client';

export const GET_EVENT_DETAILS_QUERY = gql`
  query GetEventDetails($eventId: ID!) {
    getEventDetails(eventId: $eventId) {
      id
      title
      description
      tags
      date
      location
      imageUrl
      maxVolunteers
      ngo {
        id
        name
        logoUrl
      }
      signups {
        id
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const GET_ALL_EVENTS_QUERY = gql`
  query GetAllEvents {
    getAllEvents {
      id
      title
      description
      tags
      date
      location
      imageUrl
      maxVolunteers
      ngo {
        id
        name
        logoUrl
      }
    }
  }
`;

export const GET_NGO_EVENTS_QUERY = gql`
  query GetNgoEvents($ngoId: ID!) {
    getNgoEvents(ngoId: $ngoId) {
      id
      title
      description
      tags
      date
      location
      imageUrl
      maxVolunteers
    }
  }
`;