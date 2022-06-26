/*
  Warnings:

  - Made the column `uuid` on table `Admin` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isViewOnly" BOOLEAN NOT NULL
);
INSERT INTO "new_Admin" ("email", "id", "isViewOnly", "name", "password", "uuid") SELECT "email", "id", "isViewOnly", "name", "password", "uuid" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_uuid_key" ON "Admin"("uuid");
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
