-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,
    "school" TEXT,
    "superAdmin" BOOLEAN DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "view" TEXT,
    "userId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" SERIAL NOT NULL,
    "school_name" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL,
    "school_options" TEXT[],
    "meeting_status_options" TEXT[],
    "user_role_options" TEXT[],
    "initial_view_options" TEXT[],
    "grade_options" TEXT[],
    "program_options" TEXT[],
    "services_options" TEXT[],

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingAttendees" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meeting_status" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "meeting_id" INTEGER NOT NULL,

    CONSTRAINT "MeetingAttendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meetings" (
    "id" SERIAL NOT NULL,
    "start" TIMESTAMP(6),
    "end" TIMESTAMP(6),
    "program" TEXT,
    "level_lesson" TEXT,
    "meeting_notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "recorded_on" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_by" TEXT,
    "edited_on" TIMESTAMP(6),
    "tutor_id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "dummyMeetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Students" (
    "id" SERIAL NOT NULL,
    "school" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "grade" TEXT,
    "home_room_teacher" TEXT,
    "tutor_id" INTEGER,
    "intervention_program" TEXT,
    "level_lesson" TEXT,
    "date_intervention_began" DATE,
    "services" TEXT,
    "new_student" BOOLEAN DEFAULT true,
    "moved" BOOLEAN DEFAULT false,
    "new_location" TEXT,
    "withdrew" BOOLEAN DEFAULT false,
    "additional_comments" TEXT,
    "last_edited" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "schedule" JSONB,
    "graduated" BOOLEAN DEFAULT false,
    "student_assigned_id" TEXT,

    CONSTRAINT "dummyStudents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "super_admin_role" TEXT,
    "picture" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "view" TEXT NOT NULL,

    CONSTRAINT "dummyUsers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAttendees_id_key" ON "MeetingAttendees"("id");

-- CreateIndex
CREATE UNIQUE INDEX "dummyMeetings_id_key" ON "Meetings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "dummyStudents_id_key" ON "Students"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Students_student_assigned_id_key" ON "Students"("student_assigned_id");

-- CreateIndex
CREATE UNIQUE INDEX "dummyUsers_id_key" ON "Users"("id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendees" ADD CONSTRAINT "MeetingAttendees_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendees" ADD CONSTRAINT "MeetingAttendees_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
