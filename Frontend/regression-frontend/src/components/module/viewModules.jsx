import React, { useState } from "react";
import { useGetGroupsQuery } from "../../services/runTestCases.api.services";
import {
  Box
} from "@mui/material";
import { ChevronRight, Description, ExpandMore, List, PlayArrow } from "@mui/icons-material";

export default function ViewModules() {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const {
    data: moduleData,
    isSuccess,
    isError,
    error,
    isLoading,
  } = useGetGroupsQuery();

  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getActionColor = (action) => {
    const colors = {
      use: 'bg-purple-100 text-purple-700',
      goto: 'bg-blue-100 text-blue-700',
      click: 'bg-green-100 text-green-700',
      fill: 'bg-orange-100 text-orange-700',
      check: 'bg-pink-100 text-pink-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const RunModule = () => {};
  return (
    <Box>
     <div className="grid gap-6">
              {moduleData.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {expandedGroups.has(group.id) ? (
                            <ExpandMore className="w-5 h-5 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-semibold text-slate-800">{group.name}</h2>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                              ID: {group.id}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-3">{group.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <List className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">
                              {group.testcases.length} test case{group.testcases.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
    
                  {/* Test Cases */}
                  {expandedGroups.has(group.id) && (
                    <div className="border-t border-slate-200 bg-slate-50">
                      {group.testcases.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Description className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                          <p>No test cases in this group</p>
                        </div>
                      ) : (
                        <div className="p-6 space-y-4">
                          {group.testcases.map((testcase) => (
                            <div
                              key={testcase.id}
                              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                            >
                              {/* Test Case Header */}
                              <div
                                onClick={() => setSelectedTestCase(
                                  selectedTestCase === testcase.id ? null : testcase.id
                                )}
                                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <PlayArrow className="w-5 h-5 text-emerald-600" />
                                    <div>
                                      <h3 className="font-semibold text-slate-800">{testcase.name}</h3>
                                      <p className="text-sm text-slate-500">
                                        {testcase.steps.length} steps • Created {new Date(testcase.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedTestCase === testcase.id ? (
                                    <ExpandMore className="w-5 h-5 text-slate-600" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                              </div>
    
                              {/* Test Steps */}
                              {selectedTestCase === testcase.id && (
                                <div className="border-t border-slate-200 bg-slate-50 p-4">
                                  <div className="space-y-3">
                                    {testcase.steps.map((step) => (
                                      <div
                                        key={step.step_number}
                                        className="bg-white rounded-lg p-4 border border-slate-200"
                                      >
                                        <div className="flex items-start gap-4">
                                          <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            {step.step_number}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(step.action)}`}>
                                                {step.action.toUpperCase()}
                                              </span>
                                            </div>
                                            {step.selector && (
                                              <div className="mb-2">
                                                <span className="text-xs text-slate-500 font-medium">Selector:</span>
                                                <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 break-all">
                                                  {step.selector}
                                                </code>
                                              </div>
                                            )}
                                            {step.value && (
                                              <div className="mb-2">
                                                <span className="text-xs text-slate-500 font-medium">Value:</span>
                                                <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                                                  {step.value}
                                                </code>
                                              </div>
                                            )}
                                            {step.url && (
                                              <div>
                                                <span className="text-xs text-slate-500 font-medium">URL:</span>
                                                <a
                                                  href={step.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="ml-2 text-sm text-blue-600 hover:text-blue-800 break-all"
                                                >
                                                  {step.url}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
    </Box>
  );
}
