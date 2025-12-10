import type { Request, Response } from "express";

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
    const searchData = await dynamicSearch(req, CourseModel);
    if (searchData.success) {
      return res.status(200).json({
        success: true,
        data: searchData.results,
      });
    }
    const {
      search,
      city,
      country,
      limit = 20,
      offset = 0,
    } = req.query;

    const apiUrl = new URL("https://www.golfapi.io/api/v2.3/courses");

    // Add query parameters
    if (search)
      apiUrl.searchParams.append("search", search as string);
    if (city)
      apiUrl.searchParams.append("city", city as string);
    if (country)
      apiUrl.searchParams.append("country", country as string);
    apiUrl.searchParams.append("limit", limit as string);
    apiUrl.searchParams.append("offset", offset as string);

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

    // const courses = data.courses?.map((course: any) => ({
    //   courseID: course.courseID,
    //   clubID: course.clubID,
    //   clubName: course.clubName,
    //   courseName: course.courseName,
    //   city: course.city,
    //   state: course.state,
    //   country: course.country,
    //   numHoles: course.numHoles,
    //   measure: course.measure,
    //   numTees: course.numTees,
    // })) || [];

    const courses = await CourseModel.create(data.courses);

    return res.status(200).json({
      courses,
      metadata: {
        total: data.numCourses || 0,
        limit: Number.parseInt(limit as string),
        offset: Number.parseInt(offset as string),
        apiRequestsLeft: data.apiRequestsLeft,
      },
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
      return res.status(200).json({ course });
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
    const { courseId } = req.params;

    const localCourseCoordinates = await CourseCoordinate.findOne({ courseID: courseId });

    if (localCourseCoordinates) {
      return res.status(200).json(
        {
          success: true,
          data: localCourseCoordinates,
        },
      );
    }

    // If not in database, fetch from API
    const apiUrl = `https://www.golfapi.io/api/v2.3/coordinates/${courseId}`;
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
      data: courseCoordinates,
    });
  }
  catch (error) {
    console.error("Error fetching course coordinates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
