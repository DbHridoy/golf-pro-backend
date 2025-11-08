export function selectDefaultTeeForGolfer(
  course: any,
  gender: "male" | "female",
  handicapIndex?: number,
): any {
  const tees = course.tees;

  if (!tees || tees.length === 0) {
    throw new Error("No tees available for this course");
  }

  // Filter tees with appropriate ratings for gender
  const availableTees = tees.filter((tee: any) => {
    if (gender === "male") {
      return tee.courseRatingMen && tee.slopeMen;
    }
    else {
      return tee.courseRatingWomen && tee.slopeWomen;
    }
  });

  if (availableTees.length === 0) {
    throw new Error(`No tees with ratings available for ${gender} golfers`);
  }

  let selectedTee: any;

  if (gender === "male") {
    if (handicapIndex !== undefined && handicapIndex !== null) {
      if (handicapIndex <= 5) {
        selectedTee = availableTees.find((t: any) =>
          ["Gold", "Black", "Blue", "Championship"].includes(t.teeName),
        );
      }
      else if (handicapIndex <= 15) {
        selectedTee = availableTees.find((t: any) =>
          ["Blue", "White"].includes(t.teeName),
        );
      }
      else {
        selectedTee = availableTees.find((t: any) =>
          ["White", "Green", "Yellow"].includes(t.teeName),
        );
      }
    }

    if (!selectedTee) {
      selectedTee = availableTees.find((t: any) => t.teeName === "White")
        || availableTees.find((t: any) => t.teeName === "Blue")
        || availableTees[Math.floor(availableTees.length / 2)];
    }
  }
  else {
    if (handicapIndex !== undefined && handicapIndex !== null) {
      if (handicapIndex <= 10) {
        selectedTee = availableTees.find((t: any) =>
          ["Gold", "Green", "White"].includes(t.teeName),
        );
      }
      else {
        selectedTee = availableTees.find((t: any) =>
          ["Red", "Orange"].includes(t.teeName),
        );
      }
    }
    if (!selectedTee) {
      selectedTee = availableTees.find((t: any) => t.teeName === "Red")
        || availableTees.find((t: any) => t.teeName === "Orange")
        || availableTees[availableTees.length - 1];
    }
  }

  // Final fallback: just use first available tee
  if (!selectedTee) {
    selectedTee = availableTees[0];
  }

  return selectedTee;
}

/**
 * Get course rating and slope for selected tee based on gender
 */
export function getTeeRatingsForGender(
  tee: any,
  gender: "male" | "female",
): { courseRating: number; slopeRating: number } {
  if (gender === "male") {
    return {
      courseRating: tee.courseRatingMen || 72,
      slopeRating: tee.slopeMen || 113,
    };
  }
  else {
    return {
      courseRating: tee.courseRatingWomen || 72,
      slopeRating: tee.slopeWomen || 113,
    };
  }
}
