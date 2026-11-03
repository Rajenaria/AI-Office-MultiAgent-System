import { FOUNDATION_POLICY, FoundationPolicySchema } from "../contracts/index.js";

// No setter, enable route or executable runtime exists in M01-03.
export const SERVER_POLICY = FoundationPolicySchema.parse(FOUNDATION_POLICY);

// Disposable fixtures only until an independently verified backup path exists.
// Private app-data storage is neither a worker sandbox nor a complete backup.
