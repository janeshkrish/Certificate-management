db = db.getSiblingDB("certificate_management");

db.createCollection("users");
db.createCollection("domains");
db.createCollection("certificates");

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.domains.createIndex({ name: 1 }, { unique: true });
db.domains.createIndex({ slug: 1 }, { unique: true });

db.certificates.createIndex({ certificate_number: 1 }, { unique: true });
db.certificates.createIndex({ domain_id: 1 });
db.certificates.createIndex({ visibility: 1 });
db.certificates.createIndex({ issue_date: -1 });

