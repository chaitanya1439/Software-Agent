import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[]; // Replace `any[]` with a more specific type if possible
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const main = async () => {
      try {
        // Ensure WebContainer is initialized
        if (!webContainer) {
          console.error("WebContainer is not initialized");
          return;
        }

        // Install dependencies
        const installProcess = await webContainer.spawn('npm', ['install']);
        await installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data); // Log installation output
            },
          })
        );

        // Listen for server-ready events
        webContainer.on('server-ready', (port, serverUrl) => {
          console.log(`Server is ready at ${serverUrl}:${port}`);
          setUrl(serverUrl);
        });

        // Start the development server
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
        await devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log(data); // Log server output
            },
          })
        );
      } catch (error) {
        console.error("Error during WebContainer initialization:", error);
      }
    };

    main();
  }, [webContainer]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url ? (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      ) : (
        <iframe width="100%" height="100%" src={url} />
      )}
    </div>
  );
}
