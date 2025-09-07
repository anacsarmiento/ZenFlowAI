<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GjVE2gCpvwr4GzEjWOkiZRTmTSK8jiFd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
ZenFlow AI is a wellness companion that translates the busyness of your digital calendar into personalized yoga flow recommendations. By analyzing a user’s schedule, ZenFlow AI classifies the day into three categories—slow, moderate, or advanced flow—and seamlessly suggests matching YouTube yoga videos.

The application leverages Gemini 2.5 Flash’s multimodal capabilities to process and interpret unstructured text data from calendar entries, detecting patterns of workload, stress levels, and energy demand. Flash’s fast, lightweight inference ensures recommendations are generated in real time, keeping the experience responsive and practical. Its natural language understanding is central to classifying meeting density, event importance, and downtime, while its vision-enhanced embedding features make it possible to generate intuitive visual flow suggestions that users can connect with instantly.

These Gemini features are not just supportive—they are fundamental. Without Flash’s speed, semantic reasoning, and multimodal adaptability, ZenFlow AI could not transform everyday calendar data into personalized wellness journeys. The result is an AI-driven guide that balances productivity with mindfulness, helping users flow through their days with clarity and ease.
