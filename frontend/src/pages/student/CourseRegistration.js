import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowLeft, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUsers,
  FaGraduationCap
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CourseRegistration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [registeredCourses, setRegisteredCourses] = useState([]);

  const semesters = ['First', 'Second'];
  const programs = [
    'BSc Mining Engineering',
    'BSc Mineral Engineering',
    'BSc Geological Engineering',
    'BSc Petroleum Engineering',
    'BSc Mechanical Engineering',
    'BSc Electrical Engineering',
    'BSc Computer Science and Engineering',
    'BSc Environmental and Safety Engineering',
    'BSc Mathematics',
    'BSc Physics',
    'BSc Chemistry',
    'BA Liberal Studies',
  ];
  const levels = ['100', '200', '300', '400'];

  // Fetch available courses
  const fetchCourses = async () => {
    if (!selectedSemester || !selectedProgram || !selectedLevel) return;

    setLoading(true);
    try {
      const response = await api.get('/courses', {
        params: {
          semester: selectedSemester,
          program: selectedProgram,
          level: selectedLevel,
          isActive: true,
        },
      });
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch registered courses
  const fetchRegisteredCourses = async () => {
    try {
      const response = await api.get('/courses/my-registrations');
      setRegisteredCourses(response.data.registrations);
    } catch (error) {
      console.error('Failed to fetch registered courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedSemester, selectedProgram, selectedLevel]);

  useEffect(() => {
    fetchRegisteredCourses();
  }, []);

  const handleRegisterCourse = async (courseId) => {
    try {
      await api.post('/courses/register', {
        courseId,
        semester: selectedSemester,
        academicYear: new Date().getFullYear(),
      });
      toast.success('Course registered successfully');
      fetchRegisteredCourses();
      fetchCourses(); // Refresh course list to update enrollment
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register course';
      toast.error(message);
    }
  };

  const isCourseRegistered = (courseId) => {
    return registeredCourses.some(reg => reg.course._id === courseId);
  };

  const getRegistrationStatus = (courseId) => {
    const registration = registeredCourses.find(reg => reg.course._id === courseId);
    return registration?.status || null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                to="/student"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Course Registration</h1>
                <p className="text-sm text-gray-500">Register for your courses</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Course Criteria</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <div className="flex space-x-2">
                {semesters.map((semester) => (
                  <button
                    key={semester}
                    onClick={() => setSelectedSemester(semester)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      selectedSemester === semester
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {semester}
                  </button>
                ))}
              </div>
            </div>

            {/* Program Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Program</option>
                {programs.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Level</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Course List */}
        {selectedSemester && selectedProgram && selectedLevel && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Courses - {selectedSemester} Semester, Level {selectedLevel}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {programs.find(p => p === selectedProgram)}
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center">
                <FaGraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses available for the selected criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {courses.map((course) => {
                  const isRegistered = isCourseRegistered(course._id);
                  const status = getRegistrationStatus(course._id);
                  
                  return (
                    <div key={course._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {course.courseCode}
                            </h4>
                            <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                              {course.credits} Credits
                            </span>
                            {isRegistered && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                status === 'approved' 
                                  ? 'bg-success-100 text-success-800'
                                  : status === 'pending'
                                  ? 'bg-warning-100 text-warning-800'
                                  : 'bg-error-100 text-error-800'
                              }`}>
                                {status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending' : 'Rejected'}
                              </span>
                            )}
                          </div>
                          <h5 className="text-md font-medium text-gray-900 mb-2">
                            {course.title}
                          </h5>
                          <p className="text-gray-600 text-sm mb-3">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaClock className="h-4 w-4 mr-1" />
                              <span>{course.semester} Semester</span>
                            </div>
                            <div className="flex items-center">
                              <FaUsers className="h-4 w-4 mr-1" />
                              <span>{course.currentEnrollment}/{course.maxStudents} enrolled</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {!isRegistered ? (
                            <button
                              onClick={() => handleRegisterCourse(course._id)}
                              disabled={course.currentEnrollment >= course.maxStudents}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                course.currentEnrollment >= course.maxStudents
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-primary-600 text-white hover:bg-primary-700'
                              }`}
                            >
                              {course.currentEnrollment >= course.maxStudents ? 'Full' : 'Register'}
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {status === 'approved' ? (
                                <FaCheck className="h-5 w-5 text-success-600" />
                              ) : status === 'rejected' ? (
                                <FaTimes className="h-5 w-5 text-error-600" />
                              ) : (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-warning-600"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Registered Courses Summary */}
        {registeredCourses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Your Registered Courses</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {registeredCourses.map((registration) => (
                <div key={registration._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {registration.course.courseCode} - {registration.course.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {registration.semester} Semester, {registration.academicYear}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      registration.status === 'approved' 
                        ? 'bg-success-100 text-success-800'
                        : registration.status === 'pending'
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {registration.status === 'approved' ? 'Approved' : registration.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseRegistration; 