import { PrismaClient, ReservationStatus, Role, RoomStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_HOTEL_SLUG = 'demo-hotel';
const ADMIN_PASSWORD_PLAIN = 'Admin@1234';

const roomTypeSeeds = [
  {
    name: 'Standard Room',
    description: 'Comfortable standard room',
    basePrice: 20000,
    capacity: 2,
    amenities: ['WiFi', 'TV']
  },
  {
    name: 'Deluxe Room',
    description: 'Spacious deluxe room',
    basePrice: 35500,
    capacity: 3,
    amenities: ['WiFi', 'TV', 'Mini Bar']
  },
  {
    name: 'Suite',
    description: 'Premium suite with extra space',
    basePrice: 120000,
    capacity: 4,
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Kitchenette']
  }
];

const roomSeeds = [
  { roomNumber: '101', floor: 1, roomTypeName: 'Standard Room' },
  { roomNumber: '102', floor: 1, roomTypeName: 'Standard Room' },
  { roomNumber: '201', floor: 2, roomTypeName: 'Deluxe Room' },
  { roomNumber: '202', floor: 2, roomTypeName: 'Deluxe Room' },
  { roomNumber: '301', floor: 3, roomTypeName: 'Suite' },
  { roomNumber: '302', floor: 3, roomTypeName: 'Suite' }
];

const userSeeds = [
  {
    email: 'superadmin@hotelpro.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: Role.SUPER_ADMIN
  },
  {
    email: 'owner@hotelpro.com',
    firstName: 'Hotel',
    lastName: 'Owner',
    role: Role.OWNER
  },
  {
    email: 'manager@hotelpro.com',
    firstName: 'Front',
    lastName: 'Manager',
    role: Role.MANAGER
  },
  {
    email: 'reception@hotelpro.com',
    firstName: 'Front',
    lastName: 'Desk',
    role: Role.RECEPTIONIST
  },
  {
    email: 'house@hotelpro.com',
    firstName: 'House',
    lastName: 'Keeping',
    role: Role.HOUSEKEEPING
  }
];

function isoDate(daysFromToday) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date;
}

async function seedHotel() {
  const hotel = await prisma.hotel.upsert({
    where: { slug: DEMO_HOTEL_SLUG },
    update: {
      name: 'Demo Hotel',
      address: '123 Demo Street',
      city: 'Demo City',
      country: 'Demo Country'
    },
    create: {
      name: 'Demo Hotel',
      slug: DEMO_HOTEL_SLUG,
      address: '123 Demo Street',
      city: 'Demo City',
      country: 'Demo Country',
      currency: 'NGN',
      timezone: 'UTC'
    }
  });

  console.log(`Created/updated hotel: ${hotel.name}`);
  return hotel;
}

async function seedUsers(hotelId) {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD_PLAIN, 12);

  for (const user of userSeeds) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true,
        hotelId,
        password: hashedPassword
      },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true,
        hotelId,
        password: hashedPassword
      }
    });

    console.log(`Created/updated user: ${user.email} (${user.role})`);
  }

  console.log(`Password for SUPER_ADMIN remains: ${ADMIN_PASSWORD_PLAIN}`);
}

async function seedRoomTypes(hotelId) {
  const roomTypesByName = new Map();

  for (const roomType of roomTypeSeeds) {
    const savedRoomType = await prisma.roomType.upsert({
      where: {
        hotelId_name: {
          hotelId,
          name: roomType.name
        }
      },
      update: {
        description: roomType.description,
        basePrice: roomType.basePrice,
        capacity: roomType.capacity,
        amenities: roomType.amenities.join(', ')
      },
      create: {
        hotelId,
        name: roomType.name,
        description: roomType.description,
        basePrice: roomType.basePrice,
        capacity: roomType.capacity,
        amenities: roomType.amenities.join(', ')
      }
    });

    roomTypesByName.set(roomType.name, savedRoomType);
    console.log(`Created/updated room type: ${roomType.name}`);
  }

  return roomTypesByName;
}

async function seedRooms(hotelId, roomTypesByName) {
  for (const room of roomSeeds) {
    const roomType = roomTypesByName.get(room.roomTypeName);

    if (!roomType) {
      throw new Error(`Missing room type: ${room.roomTypeName}`);
    }

    const savedRoom = await prisma.room.upsert({
      where: {
        hotelId_roomNumber: {
          hotelId,
          roomNumber: room.roomNumber
        }
      },
      update: {
        roomTypeId: roomType.id,
        floor: room.floor,
        status: RoomStatus.AVAILABLE
      },
      create: {
        hotelId,
        roomTypeId: roomType.id,
        roomNumber: room.roomNumber,
        floor: room.floor,
        status: RoomStatus.AVAILABLE
      }
    });

    console.log(`Created/updated room: ${savedRoom.roomNumber} (${room.roomTypeName})`);
  }
}

async function seedSampleReservations(hotelId) {
  const standardRoom = await prisma.room.findFirst({
    where: { hotelId, roomNumber: '101' }
  });

  const deluxeRoom = await prisma.room.findFirst({
    where: { hotelId, roomNumber: '201' }
  });

  if (!standardRoom || !deluxeRoom) {
    console.log('Skipping sample reservations: required rooms not found');
    return;
  }

  const guestOne = await prisma.guest.findFirst({
    where: { hotelId, email: 'jane.demo@example.com' }
  }) ?? await prisma.guest.create({
    data: {
      hotelId,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.demo@example.com',
      phone: '+10000000001',
      nationality: 'Demo Nationality'
    }
  });

  console.log(`Created/verified guest: ${guestOne.firstName} ${guestOne.lastName}`);

  const guestTwo = await prisma.guest.findFirst({
    where: { hotelId, email: 'john.demo@example.com' }
  }) ?? await prisma.guest.create({
    data: {
      hotelId,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.demo@example.com',
      phone: '+10000000002',
      nationality: 'Demo Nationality'
    }
  });

  console.log(`Created/verified guest: ${guestTwo.firstName} ${guestTwo.lastName}`);

  const reservationSeeds = [
    {
      marker: 'DEMO_RESERVATION_1',
      guestId: guestOne.id,
      roomId: standardRoom.id,
      checkInDate: isoDate(1),
      checkOutDate: isoDate(3),
      adults: 2,
      children: 0,
      status: ReservationStatus.CONFIRMED,
      totalAmount: 40000,
      paidAmount: 20000,
      source: 'Demo Seed'
    },
    {
      marker: 'DEMO_RESERVATION_2',
      guestId: guestTwo.id,
      roomId: deluxeRoom.id,
      checkInDate: isoDate(4),
      checkOutDate: isoDate(6),
      adults: 2,
      children: 1,
      status: ReservationStatus.PENDING,
      totalAmount: 71000,
      paidAmount: 0,
      source: 'Demo Seed'
    }
  ];

  for (const reservation of reservationSeeds) {
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        hotelId,
        notes: reservation.marker
      }
    });

    if (existingReservation) {
      console.log(`Reservation already exists: ${reservation.marker}`);
      continue;
    }

    await prisma.reservation.create({
      data: {
        hotelId,
        guestId: reservation.guestId,
        roomId: reservation.roomId,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        adults: reservation.adults,
        children: reservation.children,
        status: reservation.status,
        totalAmount: reservation.totalAmount,
        paidAmount: reservation.paidAmount,
        source: reservation.source,
        notes: reservation.marker
      }
    });

    console.log(`Created sample reservation: ${reservation.marker}`);
  }
}

async function main() {
  console.log('Starting seed...');

  const hotel = await seedHotel();
  await seedUsers(hotel.id);

  const roomTypesByName = await seedRoomTypes(hotel.id);
  await seedRooms(hotel.id, roomTypesByName);

  await seedSampleReservations(hotel.id);

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
