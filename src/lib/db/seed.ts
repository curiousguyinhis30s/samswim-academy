import { db, seedDefaultSwimmingSkills } from './index'

export const CURRENCIES = [
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
]

export async function seedDemoData() {
  // Guard: Only run on client side
  if (typeof window === 'undefined') {
    console.log('seedDemoData skipped - running on server')
    return null
  }

  try {
    // Check if already seeded
    const existingTenant = await db.tenants.where('slug').equals('samswim-academy').first()
    if (existingTenant) {
      console.log('Demo data already exists')
      return existingTenant
    }

    console.log('Seeding demo data...')

    // Create tenant - Sam Maysem in Dubai
    const tenantId = await db.tenants.add({
      name: "Sam's Swim Academy",
      slug: 'samswim-academy',
      primaryColor: '#0891b2',
      secondaryColor: '#f0fdfa',
      timezone: 'Asia/Dubai',
      currency: 'AED',
      coachingType: 'swimming',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create owner - Sam Maysem
    const ownerId = await db.users.add({
      tenantId: tenantId as number,
      email: 'sam@samswim.ae',
      passwordHash: '',
      fullName: 'Sam Maysem',
      phone: '+971 50 123 4567',
      role: 'owner',
      hourlyRate: 200, // AED
      specializations: ['Kids', 'Competitive', 'Adults', 'Water Safety'],
      bio: 'Professional swim coach with 10+ years experience in Dubai. Certified by UAE Swimming Federation.',
      notificationPreferences: { email: true, sms: true, push: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create instructor
    await db.users.add({
      tenantId: tenantId as number,
      email: 'coach.sara@samswim.ae',
      passwordHash: '',
      fullName: 'Sara Ahmed',
      phone: '+971 55 987 6543',
      role: 'instructor',
      hourlyRate: 150,
      specializations: ['Kids', 'Beginners', 'Ladies Only'],
      bio: 'Specialist in teaching young children and beginners.',
      notificationPreferences: { email: true, sms: true, push: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create demo clients - Dubai expat mix
    const clients = [
      { name: 'Ahmed Al Mansouri', email: 'ahmed@email.com', phone: '+971 50 111 1111' },
      { name: 'Emily Thompson', email: 'emily@email.com', phone: '+971 55 222 2222' },
      { name: 'Fatima Hassan', email: 'fatima@email.com', phone: '+971 50 333 3333' },
      { name: 'James Wilson', email: 'james@email.com', phone: '+971 55 444 4444' },
      { name: 'Layla Rashid', email: 'layla@email.com', phone: '+971 50 555 5555' },
      { name: 'Michael Chen', email: 'michael@email.com', phone: '+971 55 666 6666' },
      { name: 'Noura Al Ali', email: 'noura@email.com', phone: '+971 50 777 7777' },
      { name: 'Oliver Smith', email: 'oliver@email.com', phone: '+971 55 888 8888' },
    ]

    const clientIds: number[] = []
    for (const client of clients) {
      const id = await db.users.add({
        tenantId: tenantId as number,
        email: client.email,
        passwordHash: '',
        fullName: client.name,
        phone: client.phone,
        role: 'client',
        status: 'active',
        notificationPreferences: { email: true, sms: false, push: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      clientIds.push(id as number)
    }

    // Create service types with AED pricing
    const privateLesson = await db.serviceTypes.add({
      tenantId: tenantId as number,
      name: 'Private Lesson',
      description: 'One-on-one personalized instruction',
      durationMinutes: 45,
      pricePerSession: 250, // AED
      isGroupClass: false,
      maxParticipants: 1,
      minParticipants: 1,
      color: '#0891b2',
      isActive: true,
      createdAt: new Date(),
    })

    await db.serviceTypes.add({
      tenantId: tenantId as number,
      name: 'Semi-Private (2 students)',
      description: 'Small group of 2 students',
      durationMinutes: 45,
      pricePerSession: 175, // AED per person
      isGroupClass: true,
      maxParticipants: 2,
      minParticipants: 2,
      color: '#0d9488',
      isActive: true,
      createdAt: new Date(),
    })

    await db.serviceTypes.add({
      tenantId: tenantId as number,
      name: 'Group Class',
      description: 'Group instruction (3-4 students)',
      durationMinutes: 60,
      pricePerSession: 120, // AED per person
      isGroupClass: true,
      maxParticipants: 4,
      minParticipants: 3,
      color: '#14b8a6',
      isActive: true,
      createdAt: new Date(),
    })

    // Create resources (pool lanes at typical Dubai facility)
    await db.resources.add({
      tenantId: tenantId as number,
      name: 'Lane 1 - Teaching Lane',
      resourceType: 'lane',
      capacity: 4,
      description: 'Main 25m teaching lane, shallow end',
      color: '#0891b2',
      availableFrom: '06:00',
      availableUntil: '22:00',
      availableDays: [0, 1, 2, 3, 4, 5, 6], // All week
      isActive: true,
      createdAt: new Date(),
    })

    await db.resources.add({
      tenantId: tenantId as number,
      name: 'Lane 2 - Deep Lane',
      resourceType: 'lane',
      capacity: 2,
      description: '25m deep water lane for advanced swimmers',
      color: '#0d9488',
      availableFrom: '06:00',
      availableUntil: '22:00',
      availableDays: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
      createdAt: new Date(),
    })

    await db.resources.add({
      tenantId: tenantId as number,
      name: 'Kids Pool',
      resourceType: 'lane',
      capacity: 6,
      description: 'Shallow pool for young beginners',
      color: '#14b8a6',
      availableFrom: '08:00',
      availableUntil: '20:00',
      availableDays: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
      createdAt: new Date(),
    })

    // Create bookings for this week and next
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const bookingSchedule = [
      // Today
      { clientIdx: 0, daysFromNow: 0, hour: 7, serviceType: privateLesson },
      { clientIdx: 1, daysFromNow: 0, hour: 9, serviceType: privateLesson },
      { clientIdx: 2, daysFromNow: 0, hour: 16, serviceType: privateLesson },
      { clientIdx: 3, daysFromNow: 0, hour: 18, serviceType: privateLesson },
      // Tomorrow
      { clientIdx: 4, daysFromNow: 1, hour: 7, serviceType: privateLesson },
      { clientIdx: 5, daysFromNow: 1, hour: 10, serviceType: privateLesson },
      { clientIdx: 6, daysFromNow: 1, hour: 17, serviceType: privateLesson },
      // Day after
      { clientIdx: 0, daysFromNow: 2, hour: 7, serviceType: privateLesson },
      { clientIdx: 7, daysFromNow: 2, hour: 8, serviceType: privateLesson },
      { clientIdx: 1, daysFromNow: 2, hour: 15, serviceType: privateLesson },
      // More days
      { clientIdx: 2, daysFromNow: 3, hour: 9, serviceType: privateLesson },
      { clientIdx: 3, daysFromNow: 3, hour: 17, serviceType: privateLesson },
      { clientIdx: 4, daysFromNow: 4, hour: 7, serviceType: privateLesson },
      { clientIdx: 5, daysFromNow: 4, hour: 16, serviceType: privateLesson },
      { clientIdx: 6, daysFromNow: 5, hour: 10, serviceType: privateLesson },
      { clientIdx: 7, daysFromNow: 5, hour: 18, serviceType: privateLesson },
      // Next week
      { clientIdx: 0, daysFromNow: 7, hour: 7, serviceType: privateLesson },
      { clientIdx: 1, daysFromNow: 7, hour: 9, serviceType: privateLesson },
      { clientIdx: 2, daysFromNow: 8, hour: 16, serviceType: privateLesson },
    ]

    for (const schedule of bookingSchedule) {
      const startTime = new Date(today)
      startTime.setDate(today.getDate() + schedule.daysFromNow)
      startTime.setHours(schedule.hour, 0, 0, 0)

      const serviceType = await db.serviceTypes.get(schedule.serviceType as number)
      const duration = serviceType?.durationMinutes || 45

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + duration)

      const isPast = startTime < new Date()

      const bookingId = await db.bookings.add({
        tenantId: tenantId as number,
        serviceTypeId: schedule.serviceType as number,
        instructorId: ownerId as number,
        startTime,
        endTime,
        status: isPast ? 'completed' : 'confirmed',
        price: serviceType?.pricePerSession || 250,
        paymentStatus: isPast ? 'paid' : 'pending',
        createdBy: ownerId as number,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await db.bookingParticipants.add({
        tenantId: tenantId as number,
        bookingId: bookingId as number,
        clientId: clientIds[schedule.clientIdx],
        attendanceStatus: isPast ? 'present' : 'expected',
        checkedInAt: isPast ? startTime : undefined,
        createdAt: new Date(),
      })
    }

    // Seed swimming skills
    await seedDefaultSwimmingSkills(tenantId as number)

    // Add some skill assessments for existing clients
    const skills = await db.skills.where('tenantId').equals(tenantId as number).toArray()

    // Give some clients skill levels
    for (let i = 0; i < Math.min(4, clientIds.length); i++) {
      const clientSkillCount = Math.floor(Math.random() * 8) + 3 // 3-10 skills
      const shuffledSkills = [...skills].sort(() => Math.random() - 0.5).slice(0, clientSkillCount)

      for (const skill of shuffledSkills) {
        await db.skillAssessments.add({
          tenantId: tenantId as number,
          studentId: clientIds[i],
          skillId: skill.id!,
          level: Math.floor(Math.random() * 4) + 1, // Level 1-4
          assessedBy: ownerId as number,
          assessedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          createdAt: new Date(),
        })
      }
    }

    console.log('Demo data seeded for Sam Maysem in Dubai!')

    return await db.tenants.get(tenantId)
  } catch (error) {
    console.error('Error seeding demo data:', error)
    return null
  }
}
