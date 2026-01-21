import User, { UserRole } from "../../models/User.model";
import ElderlyProfile from "../../models/ElderlyProfile.model";
import EmergencyContact from "../../models/EmergencyContact.model";
import HealthProfile from "../../models/HealthProfile.model";
import { sequelize } from "../../config/database.config";
import { SubscriptionStatus, SubscriptionPlan } from "../../types/subscription.types";
import { MobilityLevel } from "../../types/mobility.types";
import { logger } from "../../utils/logger.util";
import { comparePassword, hashPassword } from "../../utils/encryption.util";
import { sendElderlyWelcomeEmail } from "../../utils/emailHelpers.util";


//  DTO Type
interface RegisterElderlyUserData {
  fullName: string;
  age: number;
  phone: string;
  email?: string;
  homeAddress: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  healthConditions?: string[];
  currentMedications?: string[];
  specialNeeds?: string;
  gender: string;
}

interface CheckElderlyRecords {
  identifier: string; // email or phone
  password: string;
}

//  Return Type (Explicit)
interface RegisterElderlyResult {
  userId: string;
  elderlyProfileId: string;
  email: string;
}

/**  Helper: Generate fallback email */
const generateFallbackEmail = (phone: string) => `elderly_${phone}@silverwalks.com`;

/** Helper: Calculate approximate DOB */
const calculateDOB = (age: number) => {
  const year = new Date().getFullYear() - age;
  return new Date(year, 0, 1); // January 1st
};

/**  Separated DB logic  */
const createElderlyRecords = async (data: RegisterElderlyUserData, t: any) => {
  const {
    fullName,
    age,
    phone,
    email,
    homeAddress,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactPhone,
    healthConditions,
    currentMedications,
    specialNeeds,
    gender,
  } = data;

  // Generate temporary password and hash it
  const tempPassword =  "SilverWalks123#"; //crypto.randomBytes(8).toString('hex'); // Generate random temp password
  const hashedPassword = await hashPassword(tempPassword);
  //  User Record
  const user = await User.create(
    {
      email: email || generateFallbackEmail(phone),
      password_hash: hashedPassword,
      role: UserRole.ELDERLY,
      is_active: true,
    },
    { transaction: t }
  );

  //  Elderly Profile
  const elderlyProfile = await ElderlyProfile.create(
    {
      user_id: user.id,
      name: fullName,
      date_of_birth: calculateDOB(age),
      phone,
      address: homeAddress,
      gender,
      subscription_plan: SubscriptionPlan.BASIC,
      subscription_status: SubscriptionStatus.ACTIVE,
      walks_remaining: 0,
      walks_used_this_month: 0,
    },
    { transaction: t }
  );

  //  Emergency Contact
  await EmergencyContact.create(
    {
      elderly_id: elderlyProfile.id,
      name: emergencyContactName,
      relationship: emergencyContactRelationship,
      phone: emergencyContactPhone,
      email: email || "",
      is_primary: true,
    },
    { transaction: t }
  );

  //  Health Profile
  await HealthProfile.create(
    {
      elderly_id: elderlyProfile.id,
      medical_conditions: healthConditions?.map((c) => ({
        condition: c,
        diagnosedDate: null,
        notes: "",
      })) || [],

      medications: currentMedications?.map((m) => ({
        medication: m,
        dosage: "",
        frequency: "",
        prescribedDate: null,
      })) || [],

      allergies: [],
      dietary_restrictions: [],
      emergency_notes: specialNeeds || "",
      mobility_level: MobilityLevel.INDEPENDENT,
    },
    { transaction: t }
  );

  return { user, elderlyProfile };
};

/**  Separated DB logic for login  */
const checkElderlyRecordsExist = async (data: CheckElderlyRecords) => {
  const { identifier, password } = data;

  let user = await User.findOne({
    where: { email: identifier },
  });

  let elderlyProfile = null;

  // If not found by email, try phone lookup
  if (!user) {
    elderlyProfile = await ElderlyProfile.findOne({
      where: { phone: identifier },
      include: [{ model: User, as: "user" }],
    });

    if (!elderlyProfile || !elderlyProfile.user_id) {
      throw new Error("Invalid credentials");
    }

    user = await User.findOne({ where: { id: elderlyProfile.user_id } });
  }

  // If somehow user still doesn't exist
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // 2️⃣ Validate password using bcrypt
  const isValidPassword = await comparePassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // 3️⃣ Fetch elderly profile if not found earlier
  if (!elderlyProfile) {
    elderlyProfile = await ElderlyProfile.findOne({
      where: { user_id: user.id },
    });

    if (!elderlyProfile) {
      throw new Error("Elderly profile not found");
    }
  }

  return { user, elderlyProfile };
}

/**
 *  PUBLIC SERVICE - REGISTER ELDERLY USER
 */
export const registerElderlyUser = async (
  data: RegisterElderlyUserData
): Promise<RegisterElderlyResult> => {
  logger.info("Starting elderly user registration", { phone: data.phone });

  try {
    const result = await sequelize.transaction(async (t) => {
      const { user, elderlyProfile } = await createElderlyRecords(data, t);

      return {
        userId: user.id,
        elderlyProfileId: elderlyProfile.id,
        email: user.email
      };
    });

    logger.info("Elderly user registration completed successfully", { userId: result.userId });
    
    // Send welcome email (non-blocking)
    const tempPassword = "SilverWalks123#";
    sendElderlyWelcomeEmail(
      result.email,
      data.fullName,
      tempPassword,
      process.env.CLIENT_URL || 'http://localhost:3000/login'
    ).catch((error: Error) => {
      logger.error('Failed to send welcome email', error);
      // Don't throw - email failure shouldn't fail registration
    });
    
    return result;
  } catch (error) {
    logger.error("Error registering elderly user", error as Error);
    throw error;
  }
};

/**
 *  LOGIN ELDERLY USER
 */
export const loginElderlyUser = async (
  identifier: string, // email OR phone
  password: string
): Promise<RegisterElderlyResult> => {
  logger.info("Attempting elderly user login", { identifier });

  try {
    const { user, elderlyProfile } = await checkElderlyRecordsExist({ identifier, password });

    logger.info("Elderly login successful", { userId: user.id });

    return {
      userId: user.id,
      elderlyProfileId: elderlyProfile.id,
      email: user.email,
    };

  } catch (error) {
    logger.error("Error logging in elderly user", error as Error);
    throw error;
  }
};
