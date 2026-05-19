import { PublishedResourceState } from '../PublishedResourceState';

export const UnsupportedResourcePage = () => {
  return (
    <PublishedResourceState
      title="Resource unavailable"
      description="This published app resource cannot be rendered in the current runtime."
    />
  );
};
