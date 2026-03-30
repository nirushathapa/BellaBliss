const bcrypt = require("bcryptjs");

const createSeedUsers = async () => {
  const passwordHash = await bcrypt.hash("password123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  return [
    {
      name: "Admin User",
      email: "admin@bellabliss.com",
      phone: "9812345678",
      password: adminHash,
      role: "admin",
    },
    {
      name: "Sarah Pro",
      email: "pro@test.com",
      phone: "9812345679",
      password: passwordHash,
      role: "professional",
      professionalDetails: {
        specialization: ["Makeup Artist", "Bridal Makeup"],
        experience: 5,
        bio: "Professional makeup artist specializing in bridal looks.",
      },
    },
    {
      name: "Bella Customer",
      email: "customer@test.com",
      phone: "9812345680",
      password: passwordHash,
      role: "customer",
    },
  ];
};

module.exports = createSeedUsers;
