// Role Enum
export const Roles = {
  GOVERNMENT: "government",
  CONTRACTOR: "contractor",
  APPROVER: "approver",
  PUBLIC: "public"
}

// Project Schema
export const ProjectSchema = {
  id: "string",
  title: "string",
  description: "string",

  location: {
    lat: "number",
    lng: "number",
    address: "string"
  },

  maximumBidAmount: "number",  //set by government while publishing contract
  contractAddress: "string|null",
  status: "bidding|active|completed",
  biddingDeadline: "timestamp"
}

// Bid Schema
export const BidSchema = {
  projectId: "string",
  contractorWallet: "string",
  totalAmount: "number",
  milestones: [
    {
      amount: "number",
      description: "string"
    }
  ]
}

// Event Schema
export const EventSchema = {
  type: "string",
  projectId: "string",
  milestoneId: "number|null",
  actor: "string",
  metadata: "object",
  timestamp: "number"
}