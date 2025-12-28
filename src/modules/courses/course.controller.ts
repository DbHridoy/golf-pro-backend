import type { Request, Response } from "express";

import { HttpStatusCode } from "axios";

import { env } from "@/env";
import { dynamicSearch } from "@/utils/search.utils";

import CourseCoordinate from "./course-coordinates.model";
import CourseDetails from "./course-details.model";
import CourseModel from "./course.model";

// export async function getCourses(req: Request, res: Response) {
//   try {
//     const config = {
//       method: "get",
//       maxBodyLength: Infinity,
//       url: "https://www.golfapi.io/api/v2.3/courses",
//       headers: { Authorization: `Bearer ${env.GOLF_API_KEY}` },
//     };

//     const response = await axios(config);

//     const courses = response.data.data;

//     const insertedCourses = await CourseModel.insertMany(courses);

//     return res.status(200).json({ message: "Get courses endpoint", data: insertedCourses });
//   }
//   catch (error) {
//     console.error("Error getting courses:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }

export async function searchCourses(req: Request, res: Response) {
  try {
    const { search, city, country, page = 1 } = req.query;

    const PAGE_SIZE = 200;
    const currentPage = Number(page);
    const skipCount = (currentPage - 1) * PAGE_SIZE;

    // Step 1: Count local courses
    const localCount = await CourseModel.countDocuments();

    // Step 2: Check if DB already has this page
    const hasThisPage = localCount >= skipCount + 1;

    // Build filter only for FIND, not for the API CACHE logic
    const filter: any = {};
    if (search) {
      filter.$or = [
        { courseName: new RegExp(search as string, "i") },
        { clubName: new RegExp(search as string, "i") },
      ];
    }
    if (city)
      filter.city = city;
    if (country)
      filter.country = country;

    // *******************************************************
    //  CASE 1 → PAGE EXISTS LOCALLY → RETURN LOCAL DATA
    // *******************************************************
    if (hasThisPage) {
      const localCourses = await CourseModel.find(filter)
        .skip(skipCount)
        .limit(PAGE_SIZE)
        .lean();

      // if filtered search returns empty but page exists locally — DO NOT FETCH API
      return res.status(200).json({
        success: true,
        source: "local",
        page: currentPage,
        data: localCourses,
      });
    }

    // *******************************************************
    //  CASE 2 → PAGE DOES NOT EXIST → FETCH FROM API
    // *******************************************************
    console.log(`⛳ Fetching page ${currentPage} from Golf API...`);

    const apiUrl = new URL("https://www.golfapi.io/api/v2.3/courses");

    apiUrl.searchParams.append("page", currentPage.toString());
    if (search)
      apiUrl.searchParams.append("search", search as string);
    if (city)
      apiUrl.searchParams.append("city", city as string);
    if (country)
      apiUrl.searchParams.append("country", country as string);

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.GOLF_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to fetch courses from Golf API",
      });
    }

    const data = await response.json();

    if (!data.courses || data.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No new courses found from API",
        page: currentPage,
      });
    }

    // *******************************************************
    //  Insert or update (prevent duplicates!)
    // *******************************************************
    await CourseModel.bulkWrite(
      data.courses.map((course: any) => ({
        updateOne: {
          filter: { courseID: course.courseID },
          update: { $set: course },
          upsert: true,
        },
      })),
    );

    // *******************************************************
    //  Return freshly fetched page
    // *******************************************************
    return res.status(200).json({
      success: true,
      source: "api",
      page: currentPage,
      inserted: data.courses.length,
      data: data.courses,
      apiRequestsLeft: data.apiRequestsLeft,
    });
  }
  catch (error) {
    console.error("Error searching courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get single course details (with tee information)
 */
export async function getCourseDetails(req: Request, res: Response) {
  try {
    const { courseID } = req.params;

    // Check if course exists in database
    const course = await CourseDetails.findOne({ courseID });

    if (course) {
      return res.status(200).json({
        success: true,
        message: "From local database",
        data: course,
      });
    }

    // If not in database, fetch from API
    const apiUrl = `https://www.golfapi.io/api/v2.3/courses/${courseID}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.GOLF_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseData = await response.json();

    const setCourseData = await CourseDetails.insertMany(courseData);

    return res.status(200).json({
      course: courseData,
      source: "api",
    });
  }
  catch (error) {
    console.error("Error fetching course details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get courses from local database (previously played courses)
 */
export async function getLocalCourses(req: Request, res: Response) {
  try {
    const { limit = 20, skip = 0, search } = req.query;

    const query: any = { isActive: true };

    if (search) {
      query.$text = { $search: search as string };
    }

    const courses = await CourseModel.find(query)
      .sort({ totalTimesPlayed: -1, courseName: 1 })
      .limit(Number.parseInt(limit as string))
      .skip(Number.parseInt(skip as string))
      .select("courseID courseName clubName location numHoles measure numTees totalTimesPlayed");

    const total = await CourseModel.countDocuments(query);

    return res.status(200).json({
      courses,
      metadata: {
        total,
        limit: Number.parseInt(limit as string),
        skip: Number.parseInt(skip as string),
      },
    });
  }
  catch (error) {
    console.error("Error fetching local courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getCourseCoordinates(req: Request, res: Response) {
  try {
    const { courseID } = req.params;

    const localCourseCoordinates = await CourseCoordinate.findOne({ courseID });

    if (localCourseCoordinates) {
      return res.status(200).json(
        {
          success: true,
          message: "From local database",
          data: localCourseCoordinates,
        },
      );
    }

    // If not in database, fetch from API
    const apiUrl = `https://www.golfapi.io/api/v2.3/coordinates/${courseID}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.GOLF_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseCoordinates = await response.json();

    const setNewLocalCourseCoordinates = await CourseCoordinate.create(courseCoordinates);

    await setNewLocalCourseCoordinates.save();

    return res.status(200).json({
      success: true,
      message: "From api",
      data: courseCoordinates,
    });
  }
  catch (error) {
    console.error("Error fetching course coordinates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
