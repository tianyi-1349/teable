interface PublishedResourceStateProps {
  title: string;
  description: string;
}

export const PublishedResourceState = ({ title, description }: PublishedResourceStateProps) => {
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border bg-background p-5 text-center shadow-sm">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
