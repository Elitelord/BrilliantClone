import MixedReview from '../components/review/MixedReview';

// Full-screen spaced-review session (sibling of the lesson route). MixedReview handles
// its own loading / empty / done states, so this wrapper just mounts it.
export default function ReviewPage() {
  return <MixedReview />;
}
