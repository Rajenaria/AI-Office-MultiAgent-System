// Fixed schema only. No SQL, migration or table names are supplied by clients.
export const SCHEMA_V1 = `
PRAGMA user_version=1;
CREATE TABLE project_header (
 singleton INTEGER PRIMARY KEY CHECK(singleton=1), projectId TEXT NOT NULL UNIQUE,
 schemaVersion INTEGER NOT NULL CHECK(schemaVersion=1), createdAt TEXT NOT NULL,
 snapshotVersion INTEGER NOT NULL CHECK(snapshotVersion>0), seedHash TEXT
) STRICT;
CREATE TABLE knowledge (
 projectId TEXT NOT NULL REFERENCES project_header(projectId), knowledgeId TEXT NOT NULL,
 version INTEGER NOT NULL CHECK(version>0), relativePath TEXT NOT NULL, contentHash TEXT NOT NULL,
 source TEXT NOT NULL, status TEXT NOT NULL, createdAt TEXT NOT NULL,
 PRIMARY KEY(projectId,knowledgeId,version)
) STRICT;
CREATE TABLE tasks (
 projectId TEXT NOT NULL REFERENCES project_header(projectId), taskId TEXT NOT NULL,
 demoAgentId TEXT NOT NULL CHECK(demoAgentId LIKE 'demo:%'), title TEXT NOT NULL, state TEXT NOT NULL,
 version INTEGER NOT NULL CHECK(version>0), updatedAt TEXT NOT NULL, source TEXT NOT NULL CHECK(source='demo'),
 PRIMARY KEY(projectId,taskId), UNIQUE(projectId,taskId,demoAgentId)
) STRICT;
CREATE TABLE events (
 projectId TEXT NOT NULL REFERENCES project_header(projectId), eventId TEXT NOT NULL, taskId TEXT NOT NULL,
 agentId TEXT NOT NULL, sequence INTEGER NOT NULL CHECK(sequence>0), type TEXT NOT NULL,
 occurredAt TEXT NOT NULL, payloadVersion INTEGER NOT NULL CHECK(payloadVersion=1), source TEXT NOT NULL CHECK(source='demo'),
 PRIMARY KEY(projectId,eventId), UNIQUE(projectId,sequence),
 FOREIGN KEY(projectId,taskId,agentId) REFERENCES tasks(projectId,taskId,demoAgentId)
) STRICT;
`;
