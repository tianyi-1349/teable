import { motionClassNames } from '../motion';
import { cn } from '../utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md bg-primary/10', motionClassNames.skeleton, className)}
      {...props}
    />
  );
}

export { Skeleton };
