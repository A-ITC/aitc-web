import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClapperboard,
  faMusic,
  faPalette,
  faTerminal,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

const departmentIcons: Partial<Record<string, IconDefinition>> = {
  CG: faPalette,
  PROG: faTerminal,
  DTM: faMusic,
  MV: faClapperboard,
};

export function DepartmentList({ departments }: { departments: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {departments.map((department, index) => {
        const icon = departmentIcons[department];

        return (
          <span
            className="inline-flex items-center gap-1 whitespace-nowrap"
            key={`${department}-${index}`}
          >
            {index > 0 && <span aria-hidden="true">/</span>}
            {icon && (
              <FontAwesomeIcon
                icon={icon}
                size="1x"
                className="shrink-0"
                aria-hidden="true"
              />
            )}
            <span>{department}</span>
          </span>
        );
      })}
    </span>
  );
}
