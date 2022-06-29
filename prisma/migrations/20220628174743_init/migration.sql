-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isViewOnly" BOOLEAN NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signup" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "Signup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mon" TEXT[],
    "tues" TEXT[],
    "wed" TEXT[],
    "thrs" TEXT[],
    "fri" TEXT[],
    "subject" TEXT[],

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_uuid_key" ON "Admin"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_uuid_key" ON "Signup"("uuid");
