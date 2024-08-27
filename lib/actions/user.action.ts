"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";

export async function getUserById(userId: string) {
  try {
    connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    // const { searchQuery, filter, page = 1, pageSize = 10 } = params;
    // const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    // if (searchQuery) {
    //   const escapedSearchQuery = searchQuery.replace(
    //     /[.*+?^${}()|[\]\\]/g,
    //     "\\$&"
    //   );
    //   query.$or = [
    //     { name: { $regex: new RegExp(escapedSearchQuery, "i") } },
    //     { username: { $regex: new RegExp(escapedSearchQuery, "i") } },
    //   ];
    // }

    // let sortOptions = {};

    // switch (filter) {
    //   case "new_users":
    //     sortOptions = { joinedAt: -1 };
    //     break;
    //   case "old_users":
    //     sortOptions = { joinedAt: 1 };
    //     break;
    //   case "top_contributors":
    //     sortOptions = { reputation: -1 };
    //     break;

    //   default:
    //     break;
    // }

    const users = await User.find(query).sort({ createdAt: -1 });
    // .skip(skipAmount)
    // .limit(pageSize);

    // const totalUsers = await User.countDocuments(query);
    // const isNext = totalUsers > skipAmount + users.length;

    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete user from database
    // and questions, answers, comments, etc.

    // get user question ids
    // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

    // delete user questions
    await Question.deleteMany({ author: user._id });

    // TODO: delete user answers, comments, etc.

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
