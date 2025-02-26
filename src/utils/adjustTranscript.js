// src/utils/adjustTranscript.js
/**
 * Adjusts transcript segments when a deletion occurs.
 *
 * Each transcript segment is assumed to have:
 *  - effectiveStart, effectiveEnd (in seconds)
 *  - text (the transcript for that segment)
 *  - startFormatted, endFormatted (formatted times)
 *
 * We assume the text is uniformly distributed over the segment.
 * When a deletion occurs (from deletionStart to deletionEnd), we:
 *  - Keep segments completely before deletion as-is.
 *  - Shift segments completely after deletion left by the deletion duration.
 *  - For segments that partially overlap the deletion range:
 *     - If the deletion covers the end of a segment, trim the text at the deletion start.
 *     - If the deletion covers the beginning of a segment, trim the text at the deletion end and shift that segment.
 *     - If the deletion is strictly in the middle of a segment, split the segment into two:
 *       one before deletion and one after (with the latter shifted left).
 *
 * @param {Array} transcript - The current transcript segments.
 * @param {number} deletionStart - The start time (in seconds) of the deletion.
 * @param {number} deletionEnd - The end time (in seconds) of the deletion.
 * @param {function} formatTime - A function that formats seconds as HH:MM:SS.
 * @returns {Array} The updated transcript segments.
 */
export function adjustTranscriptTimestamps(transcript, deletionStart, deletionEnd, formatTime) {
    const deletionDuration = deletionEnd - deletionStart;
    const newTranscript = [];
  
    transcript.forEach(seg => {
      const segStart = seg.effectiveStart;
      const segEnd = seg.effectiveEnd;
  
      // Case 1: Segment is completely before the deletion.
      if (segEnd <= deletionStart) {
        newTranscript.push(seg);
      }
      // Case 2: Segment is completely after the deletion.
      else if (segStart >= deletionEnd) {
        newTranscript.push({
          ...seg,
          effectiveStart: segStart - deletionDuration,
          effectiveEnd: segEnd - deletionDuration,
          startFormatted: formatTime(segStart - deletionDuration),
          endFormatted: formatTime(segEnd - deletionDuration)
        });
      }
      // Case 3: Segment overlaps the deletion.
      else {
        // If the deletion completely covers this segment, skip it.
        if (segStart >= deletionStart && segEnd <= deletionEnd) {
          return;
        }
  
        // If the segment starts before deletion and ends after deletion,
        // then split it into two segments.
        if (segStart < deletionStart && segEnd > deletionEnd) {
          // Compute fraction of text for the first part.
          const totalDuration = segEnd - segStart;
          const firstDuration = deletionStart - segStart;
          const fractionFirst = firstDuration / totalDuration;
          const firstText = seg.text.substring(0, Math.floor(seg.text.length * fractionFirst));
  
          const firstSegment = {
            ...seg,
            id: seg.id + "-1",
            effectiveEnd: deletionStart,
            endFormatted: formatTime(deletionStart),
            text: firstText
          };
  
          // For the second segment, shift times by deletionDuration.
          const secondDuration = segEnd - deletionEnd;
          const fractionSecond = secondDuration / totalDuration;
          // We take the latter part of the text.
          const secondText = seg.text.substring(Math.floor(seg.text.length * (1 - fractionSecond)));
  
          const secondSegment = {
            ...seg,
            id: seg.id + "-2",
            effectiveStart: deletionEnd - deletionDuration,
            effectiveEnd: segEnd - deletionDuration,
            startFormatted: formatTime(deletionEnd - deletionDuration),
            endFormatted: formatTime(segEnd - deletionDuration),
            text: secondText
          };
  
          newTranscript.push(firstSegment, secondSegment);
        }
        // If the deletion overlaps the end of the segment:
        else if (segStart < deletionStart && segEnd > deletionStart && segEnd <= deletionEnd) {
          // Trim the segment's end at the deletion start.
          const newEnd = deletionStart;
          const fraction = (newEnd - segStart) / (segEnd - segStart);
          const trimmedText = seg.text.substring(0, Math.floor(seg.text.length * fraction));
          newTranscript.push({
            ...seg,
            effectiveEnd: newEnd,
            endFormatted: formatTime(newEnd),
            text: trimmedText
          });
        }
        // If the deletion overlaps the beginning of the segment:
        else if (segStart >= deletionStart && segStart < deletionEnd && segEnd > deletionEnd) {
          // Trim the segment's start to deletionEnd and shift it.
          const newStart = deletionEnd;
          const fraction = (segEnd - newStart) / (segEnd - segStart);
          const trimmedText = seg.text.substring(Math.floor(seg.text.length * (1 - fraction)));
          newTranscript.push({
            ...seg,
            effectiveStart: newStart - deletionDuration,
            startFormatted: formatTime(newStart - deletionDuration),
            text: trimmedText
          });
        }
      }
    });
  
    return newTranscript;
  }
  