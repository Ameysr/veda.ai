import type { Difficulty } from "@/types";
import clsx from "clsx";

const labels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={clsx(
        difficulty === "easy" && "badge-easy",
        difficulty === "medium" && "badge-medium",
        difficulty === "hard" && "badge-hard"
      )}
    >
      {labels[difficulty]}
    </span>
  );
}
