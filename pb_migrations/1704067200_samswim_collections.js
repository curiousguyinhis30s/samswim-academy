/// <reference path="../pb_data/types.d.ts" />

migrate((db) => {
  // 1. branches
  const branches = new Collection({
    name: "branches",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "address", type: "text" },
      { name: "phone", type: "text" },
      { name: "email", type: "email" },
      { name: "is_active", type: "bool", options: { default: true } }
    ]
  });
  db.save(branches);

  // 2. students
  const students = new Collection({
    name: "students",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "email", type: "email" },
      { name: "phone", type: "text" },
      { name: "date_of_birth", type: "date" },
      { name: "skill_level", type: "text" },
      { name: "notes", type: "text" }
    ]
  });
  db.save(students);

  // 3. lesson_packages
  const lessonPackages = new Collection({
    name: "lesson_packages",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "price_myr", type: "number", required: true },
      { name: "lessons_count", type: "number" },
      { name: "validity_days", type: "number" }
    ]
  });
  db.save(lessonPackages);

  // 4. schedules
  const schedules = new Collection({
    name: "schedules",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "branch_id", type: "relation", options: { collectionId: branches.id, maxSelect: 1 } },
      { name: "coach_id", type: "text" },
      { name: "start_time", type: "date", required: true },
      { name: "end_time", type: "date", required: true },
      { name: "capacity", type: "number", options: { default: 10 } }
    ]
  });
  db.save(schedules);

  // 5. payments
  const payments = new Collection({
    name: "payments",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "student_id", type: "relation", options: { collectionId: students.id, maxSelect: 1 } },
      { name: "amount", type: "number", required: true },
      { name: "currency", type: "text", options: { default: "MYR" } },
      { name: "status", type: "select", options: { values: ["pending", "paid", "failed", "refunded"] } },
      { name: "payment_method", type: "text" },
      { name: "reference", type: "text" },
      { name: "package_type", type: "text" },
      { name: "stripe_session_id", type: "text" }
    ]
  });
  db.save(payments);

  // 6. bookings
  const bookings = new Collection({
    name: "bookings",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "student_id", type: "relation", options: { collectionId: students.id, maxSelect: 1 } },
      { name: "schedule_id", type: "relation", options: { collectionId: schedules.id, maxSelect: 1 } },
      { name: "date", type: "date", required: true },
      { name: "status", type: "select", options: { values: ["confirmed", "cancelled", "completed", "noshow"] } }
    ]
  });
  db.save(bookings);

  // 7. booking_credits
  const bookingCredits = new Collection({
    name: "booking_credits",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "student_id", type: "relation", options: { collectionId: students.id, maxSelect: 1 } },
      { name: "credits", type: "number", required: true },
      { name: "payment_id", type: "relation", options: { collectionId: payments.id, maxSelect: 1 } },
      { name: "expires_at", type: "date" }
    ]
  });
  db.save(bookingCredits);

  // 8. subscriptions
  const subscriptions = new Collection({
    name: "subscriptions",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "student_id", type: "relation", options: { collectionId: students.id, maxSelect: 1 } },
      { name: "subscription_id", type: "text", required: true },
      { name: "status", type: "select", options: { values: ["active", "cancelled", "past_due", "trialing"] } },
      { name: "plan_id", type: "text" }
    ]
  });
  db.save(subscriptions);

  // 9. activity_logs
  const activityLogs = new Collection({
    name: "activity_logs",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "action", type: "text", required: true },
      { name: "details", type: "json" }
    ]
  });
  db.save(activityLogs);

  // 10. attendance
  const attendance = new Collection({
    name: "attendance",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "student_id", type: "relation", options: { collectionId: students.id, maxSelect: 1 } },
      { name: "schedule_id", type: "relation", options: { collectionId: schedules.id, maxSelect: 1 } },
      { name: "checked_in_at", type: "date", required: true }
    ]
  });
  db.save(attendance);

  // 11. enrollments
  const enrollments = new Collection({
    name: "enrollments",
    type: "base",
    schema: [
      { name: "tenant_id", type: "text", required: true },
      { name: "student_id", type: "relation", options: { collectionId: students.id, maxSelect: 1 } },
      { name: "package_id", type: "relation", options: { collectionId: lessonPackages.id, maxSelect: 1 } },
      { name: "status", type: "select", options: { values: ["active", "completed", "cancelled"] } },
      { name: "payment_reference", type: "text" }
    ]
  });
  db.save(enrollments);

  // 12. branch_staff
  const branchStaff = new Collection({
    name: "branch_staff",
    type: "base",
    schema: [
      { name: "branch_id", type: "relation", options: { collectionId: branches.id, maxSelect: 1 }, required: true },
      { name: "user_id", type: "text", required: true },
      { name: "role", type: "select", options: { values: ["instructor", "admin", "receptionist", "manager"] } }
    ]
  });
  db.save(branchStaff);

  // 13. branch_settings
  const branchSettings = new Collection({
    name: "branch_settings",
    type: "base",
    schema: [
      { name: "branch_id", type: "relation", options: { collectionId: branches.id, maxSelect: 1 }, required: true },
      { name: "key", type: "text", required: true },
      { name: "value", type: "text" }
    ]
  });
  db.save(branchSettings);

}, (db) => {
  // Rollback - delete in reverse order
  db.delete("branch_settings");
  db.delete("branch_staff");
  db.delete("enrollments");
  db.delete("attendance");
  db.delete("activity_logs");
  db.delete("subscriptions");
  db.delete("booking_credits");
  db.delete("bookings");
  db.delete("payments");
  db.delete("schedules");
  db.delete("lesson_packages");
  db.delete("students");
  db.delete("branches");
});
