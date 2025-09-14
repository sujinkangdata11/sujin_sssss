/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export default {
  '영상 분석': {
    emoji: '👀',
    prompt: `Generate descriptive captions for this video. For each distinct scene, provide a caption describing the visual action and including any spoken text in quotation marks. You MUST call the "set_timecodes" function, providing a list of all captions, each with its corresponding start time. 이 영상이 어떠한 상황인지 어느나라의 문화인지, 장면을 세밀하게 분석해서 모든 정보를 알려줘.`,
    isList: true,
  },

  // Paragraph: {
  //   emoji: '📝',
  //   prompt: `Generate a 3 to 5 sentence summary of this video. You MUST call the "set_timecodes" function, providing each sentence of the summary and its corresponding start time in the video.`,
  // },

  // 'Key moments': {
  //   emoji: '🔑',
  //   prompt: `Identify the key moments in the video and generate a bulleted list. You MUST call the "set_timecodes" function, providing each bullet point and its corresponding start time in the video.`,
  //   isList: true,
  // },


  '커스텀': {
    emoji: '🔧',
    prompt: (input) =>
      `Call set_timecodes once using the following instructions: ${input}`,
    isList: true,
  },
};
