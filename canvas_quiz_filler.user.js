// ==UserScript==
// @name        Canvas Quiz - correct answer filler
// @namespace   https://github.com/rtk0c
// @match       https://*.instructure.com/courses/*/quizzes/*
// @grant       none
// @version     1.0
// @author      -
// @description 3/9/2024, 2:25:27 PM
// ==/UserScript==

/**
 * @param {string} courseID
 * @param {string} quizID
 * @param {string} baseURL
 */
async function fetchPreviousAttempts(courseID, quizID, baseURL) {
  // Adapted from Canvas-Quiz-Loader Chrome extension, submissions.js
  const [quiz, userSelf] = await Promise.all([
    // There is an API endpoing for "quiz submissions" that's just appending "/submissions" to this URL, but it doesn't actually return what answerswhere submitted in historical attempts
    fetch(`${baseURL}/api/v1/courses/${courseID}/quizzes/${quizID}`).then(resp => resp.json()),
    fetch(`${baseURL}/api/v1/users/self`).then(resp => resp.json()),
  ])

  const assignmentID = quiz["assignment_id"]
  const userID = userSelf["id"]

  const historyResp = await fetch(`${baseURL}/api/v1/courses/${courseID}/assignments/${assignmentID}/submissions/${userID}?include[]=submission_history`)
  const history = await.historyResp.json()

  return history["submission_history"]
}

// Canvas quiz questions have an unique ID, and each available multiple choice answers have their own unique ID too (single or multi-select). We just need to copy this answer ID to the new quiz attempt.

/**
 * Extract correct answers from a submission_history.
 */
function filterCorrectAnswers(attempts) {
  let result = {}

  for (const attempt of attempts) {
    for (const question of attempt["submission_data"]) {
      if (question["correct"] == false)
        continue
      // Answer data exist as anwser_* fields in the object, exactly what depends on the question type
      // So we just don't bother extracting them. When it comes time to reapply to the currenct page, just copy the fields.
      result[question["question_id"]] = question
    }
  }

  return result
}

/**
 * Fill in correct answers on the correct page
 */
function fillCorrectAnswers(correctAnswers) {
  for (const [questionID, data] of correctAnswers) {
    // TODO
  }
}
