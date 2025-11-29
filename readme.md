# RestoreFlow

Transform your old black and white photos into vibrant, modern images using AI powered by [FAL AI's Flux Kontext model](https://fal.ai/models/fal-ai/flux-pro/kontext/api).

> 🚀 **Coming Soon**: Video transformation features to bring your restored photos to life!

## Features

- 📸 **Easy Upload**: Drag and drop or click to upload photos
- 🎨 **AI-Powered Restoration**: Uses Flux Kontext for high-quality photo restoration
- ⚡ **Real-time Processing**: See your restored photos in real-time
- 🎯 **Custom Prompts**: Optional custom restoration prompts for specific results
- 💾 **Download Results**: Download your restored photos instantly
- 🌙 **Dark Mode Support**: Beautiful UI that works in light and dark modes
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- A FAL AI API key (sign up at [fal.ai](https://fal.ai))

### Installation

1. Clone this repository or use this as your starting template
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory:
   ```bash
   FAL_KEY=your_fal_ai_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting a FAL AI API Key

1. Visit [fal.ai](https://fal.ai)
2. Sign up for an account
3. Navigate to your API settings
4. Generate a new API key
5. Copy the key and add it to your `.env.local` file

## How to Use

1. **Upload a Photo**: 
   - Drag and drop an old black and white photo onto the upload area
   - Or click the upload area to select a file from your device

2. **Optional Custom Prompt**: 
   - Add a custom restoration prompt if you want specific results
   - For example: "Restore this vintage family photo with warm, natural colors and enhance the clothing details"
   - Leave empty to use the default restoration prompt

3. **Restore**: 
   - Click the "Restore Photo" button
   - Wait for the AI to process your image (usually takes 10-30 seconds)

4. **Download**: 
   - Once restoration is complete, download your restored photo
   - Compare the before and after results side by side

## Technical Details

### Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **FAL AI Client** - Integration with Flux Kontext model

### API Endpoints

- `POST /api/upload` - Handles file uploads to FAL storage
- `POST /api/restore` - Processes photo restoration using Flux Kontext

### Key Features

- **File Upload**: Supports drag-and-drop and click-to-upload
- **Image Processing**: Uses FAL AI's Flux Kontext model for restoration
- **Responsive UI**: Beautiful, modern interface that works on all devices
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Clear feedback during upload and processing

## Environment Variables

Create a `.env.local` file with the following:

```bash
# FAL AI API Key (required)
FAL_KEY=your_fal_ai_api_key_here
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `FAL_KEY` environment variable in Vercel's dashboard
4. Deploy!

### Deploy to Other Platforms

Make sure to set the `FAL_KEY` environment variable in your deployment platform.

## Customization

### Custom Restoration Prompts

You can customize the default restoration behavior by modifying the prompt in `app/api/restore/route.ts`:

```typescript
const restorePrompt = prompt || "Your custom default prompt here";
```

### Styling

The app uses Tailwind CSS. You can customize the appearance by modifying the classes in `app/components/PhotoRestorer.tsx`.

### Model Parameters

You can adjust the Flux Kontext model parameters in `app/api/restore/route.ts`:

```typescript
const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
  input: {
    prompt: restorePrompt,
    image_url: imageUrl,
    guidance_scale: 3.5, // Adjust for prompt adherence
    num_images: 1,
    output_format: "jpeg",
    safety_tolerance: "2",
  },
  // ... other options
});
```

## Troubleshooting

### Common Issues

1. **"Invalid src prop" error**: 
   - Make sure you've restarted your development server after updating `next.config.ts`

2. **"FAL_KEY environment variable is not set"**: 
   - Ensure you've created a `.env.local` file with your FAL AI API key
   - Restart your development server after adding environment variables

3. **Upload fails**: 
   - Check that your image file is a valid format (JPG, PNG, etc.)
   - Ensure your FAL AI API key has sufficient credits

4. **Restoration takes too long**: 
   - The Flux Kontext model typically takes 10-30 seconds
   - Check the browser console for any error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues with the app, please create an issue on GitHub.
For FAL AI API issues, check the [FAL AI documentation](https://fal.ai/docs) or contact their support.

---

**RestoreFlow** - Built with ❤️ using [FAL AI](https://fal.ai) and [Next.js](https://nextjs.org)
