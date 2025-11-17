import { CalendarMonth, ChevronRight, ChevronRightRounded, ChevronRightTwoTone, Person, Person3 } from "@mui/icons-material";
import { Card, CardContent, CardHeader } from "@mui/material";

export default function TeamList({ teams }) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        Teams Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams?.map((team) => (
          <div
            key={team.id}
            
          >
          <Card
  className="rounded-2xl border border-gray-200 dark:border-gray-700 
             bg-gradient-to-br from-gray-50 via-white to-gray-100 
            
             shadow-lg hover:shadow-emerald-300/40 transition-all duration-300 h-64"
>
  {/* Header */}
  <CardHeader
    title={team.name}
    className="flex items-center justify-between 
               text-xl font-semibold text-gray-800 
               border-b border-gray-100 dark:border-gray-700 
               bg-gradient-to-r from-indigo-100/60 to-emerald-50  p-2"
    avatar={
      <ChevronRightTwoTone 
        className="w-8 h-8 text-indigo-600 
                   bg-white rounded-full p-1 
                   transition-transform duration-300 group-hover:rotate-90"
      />
    }
  />

  {/* Content */}
  <CardContent className="p-6 space-y-6">
    
    {/* Created At */}
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
      <CalendarMonth className="w-5 h-5 opacity-80 text-emerald-500" />
      <p className="text-sm">
        Created:{" "}
        <span className="font-medium text-indigo-700 dark:text-indigo-300">
          {new Date(team.created_at).toLocaleDateString()}
        </span>
      </p>
    </div>

    {/* Members */}
    <div className="p-2">
      <h3 className="text-xs font-bold mb-3 text-indigo-500 dark:text-emerald-400 
                     uppercase tracking-wider">
        Members
      </h3>

      <div className="space-y-4  max-h-[70px] overflow-auto">
        {team.members?.map((m, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 
                       bg-gray-50 dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 
                       p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 
                       transition-colors duration-200"
          >
            <Person3 className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {m.username}
              </p>
              <p className="text-xs text-indigo-500 dark:text-emerald-400">
                {m.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>

          </div>
        ))}
      </div>
    </div>
  );
}
