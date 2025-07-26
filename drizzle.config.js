/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: "postgresql",
    dbCredentials: {
        url: 'postgresql://accounts:npg_2w5jDsGixUnI@ep-wandering-pond-a4o4id70-pooler.us-east-1.aws.neon.tech/ai-mock-interview?sslmode=require',
    }
};
