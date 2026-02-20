-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StampTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "backgroundUrl" TEXT NOT NULL,
    "backgroundWidth" REAL NOT NULL,
    "backgroundHeight" REAL NOT NULL,
    "backgroundX" REAL NOT NULL,
    "backgroundY" REAL NOT NULL,
    "userImageWidth" REAL NOT NULL,
    "userImageHeight" REAL NOT NULL,
    "userImageX" REAL NOT NULL,
    "userImageY" REAL NOT NULL,
    "userImageCount" INTEGER NOT NULL DEFAULT 1,
    "userImageSpacing" REAL NOT NULL DEFAULT 0,
    "realStampSampleUrl" TEXT,
    "realStampX" REAL,
    "realStampY" REAL,
    "whiteBorderUrl" TEXT,
    "whiteBorderX" REAL,
    "whiteBorderY" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StampTemplate" ("backgroundHeight", "backgroundUrl", "backgroundWidth", "backgroundX", "backgroundY", "createdAt", "height", "id", "name", "updatedAt", "userImageHeight", "userImageWidth", "userImageX", "userImageY", "width") SELECT "backgroundHeight", "backgroundUrl", "backgroundWidth", "backgroundX", "backgroundY", "createdAt", "height", "id", "name", "updatedAt", "userImageHeight", "userImageWidth", "userImageX", "userImageY", "width" FROM "StampTemplate";
DROP TABLE "StampTemplate";
ALTER TABLE "new_StampTemplate" RENAME TO "StampTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
