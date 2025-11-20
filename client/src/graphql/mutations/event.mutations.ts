import { gql } from '@apollo/client';

export const SIGNUP_FOR_EVENT_MUTATION = gql`
  mutation SignupForEvent($eventId: ID!) {
    signupForEvent(eventId: $eventId) {
      id
      status
      event {
        id
        title
      }
      user {
        id
        name
      }
    }
  }
`;

export const CANCEL_SIGNUP_MUTATION = gql`
  mutation CancelSignupForEvent($eventId: ID!) {
    cancelSignupForEvent(eventId: $eventId) {
      id
      status
    }
  }
`;

export const MARK_ATTENDANCE_MUTATION = gql`
  mutation MarkAttendance($signupId: ID!, $attended: Boolean!) {
    markAttendance(signupId: $signupId, attended: $attended) {
      id
      status
      user {
        id
        name
      }
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      description
      date
      location
      tags
      imageUrl
      maxVolunteers
    }
  }
`;

export const GENERATE_EVENT_TAGS_MUTATION = gql`
  mutation GenerateEventTags($description: String!) {
    generateEventTags(description: $description)
  }
`;