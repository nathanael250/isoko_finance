import React, { useState, useEffect } from "react";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import CommentIcon from "@mui/icons-material/Comment";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo"; // Video
import PlayCircleIcon from "@mui/icons-material/PlayCircle"; // Video Play
import MovieIcon from "@mui/icons-material/Movie"; // Movie/Film
import FavoriteIcon from "@mui/icons-material/Favorite"; // Interest (Heart)
import StarIcon from "@mui/icons-material/Star"; // Interest (Star)
import WhatshotIcon from "@mui/icons-material/Whatshot"; // Trending Interest (Fire)
import getThemeClasses from "../Shared/UiTheme";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import D3BarChart from "../Shared/BarChart"
import GrowthLineChart from "../Shared/GrowthLineChart"
import { User, Channel } from '../Shared/types'; //added
import { BarChart } from "@mui/icons-material";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useUser } from "../Shared/userContext";

interface MainContentProps {
  channel:Channel[];
  snapshotData: string[];
  user: User;
  userCredits: number;
  handleButtonClick: (buttonIndex: string) => void;
  convertDate: (date: string) => void;
  
}

const MainContent: React.FC<MainContentProps> = ({
  channel,
  handleButtonClick,
 
}) => {

  

 const { userData, userChannels, userCredits, darkMode, setDarkMode } = useUser();

 const user =  userChannels[0];
 const uiTheme = getThemeClasses(darkMode);



const  [displayedChannel, setDisplayedChannel] = useState<Channel[]>([]);
const  [snapshotData, setSnapshotData] = useState<string[]>([]);
const  [isUpdating, setIsUpdating] = useState<boolean>(false);
const  [showMessage, setShowMessage] = useState<boolean>(false);
const  [channelUpdated, setChannelUpdated] = useState<boolean>(false);
const  [gainedViews, setGainedViews] = useState<number>(0);
const  [gainedSubs, setGainedSubs] = useState<number>(0);
const  [videoMade, setVideoMade] = useState<number>(0);



useEffect(() => {
  // Save active channel to localStorage
  if (channel) {
    localStorage.setItem("activeChannel", JSON.stringify(channel));
    setDisplayedChannel(channel);
  }

  // Fetch from Database if no valid channel is available
  if (!channel || Object.keys(channel).length === 0) {
    const fetchChannelData = async () => {
      try {
        const response = await fetch(`/api/channels/${userData?.channels[0].channelId}`);
        if (!response.ok) throw new Error(`Failed to fetch channel data: ${response.statusText}`);

        const data = await response.json();
        console.log('Fetched Channel :'+JSON.stringify(data))
        setDisplayedChannel([data]);
      } catch (error) {
        console.error("Error fetching channel data:", error); // ✅ This will now always show
      }
    };

    fetchChannelData();
  }

  // Update snapshot data
  setSnapshotData(userData.channelSnapshots);
  updated(displayedChannel?.snapshotUpdatedAt);
}, [channel, userData.channelSnapshots]);



  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num < 1e6) return num.toLocaleString() ;
    return num;
  };

  const calculateChannelEngagementRate = (
    totalViews: number,
    totalComments: number,
    totalLikes: number
  ): number => {
    if (totalViews === 0) {
      return 0; // Avoid division by zero
    }
  
    const engagementRate = ((totalLikes + totalComments) / totalViews) * 100;
    return engagementRate;
  };
  
  const updated = (dateString: string | Date): boolean => {
    console.log("Input Date is: " + dateString);
  
    // Ensure dateString is a Date object
    const inputDate = new Date(dateString);
    const today = new Date();
  
    // Remove time from both dates to compare only YYYY-MM-DD
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    const isUpdatedToday = inputDate.getTime() === today.getTime();
  
    console.log(
      `Input Year: ${inputDate.getFullYear()} | This year: ${today.getFullYear()} | ` +
      `Input Month: ${inputDate.getMonth()} | This Month: ${today.getMonth()} | ` +
      `Input Day: ${inputDate.getDate()} | Today: ${today.getDate()}`
    );
  
    // Update state only if snapshotUpdatedAt is today
    if (dateString && isUpdatedToday) {
      setChannelUpdated(true);
    }
  };
  
  const convertDate = (date: string) => {
    const publishDate = new Date(date).toLocaleDateString();
    return publishDate;
  };
   const handleSnapshot = async (channelId: string | null, userId: string | undefined) => {
    setIsUpdating(true);
    
    // Ensure updatedTodayArray is an array
    let updatedTodayArray = JSON.parse(localStorage.getItem('updatedToday') || '[]');
    
    // Check if channelId is valid and not already in the array, then add it
    if (channelId && !updatedTodayArray.includes(channelId)) {
      updatedTodayArray.push(channelId);
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/channels/snapshot-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          updateChannel: channelId, 
          userId
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
       
        if(result.success){  //setting the message for notification
          
          setShowMessage(true);
        }
        const updatedResult = result.snapshot;
 
        setDisplayedChannel({
          ...displayedChannel,
          subscriberCount: updatedResult.subscriberCount,
          viewCount: updatedResult.viewCount,
          videoCount: updatedResult.videoCount,
          latestVideos: updatedResult.lastTenVideos,
          topVideos: updatedResult.mostViewedVideos,
        })
        // Save the updated array back to localStorage
        localStorage.setItem('updatedToday', JSON.stringify(updatedTodayArray));
   
        setChannelUpdated(true); // Indicate update success
        toast.success('Updated successful!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: 50,
          className: 'custom-toast',
          closeButton: <button className="custom-toast-close">X</button>,
          style: {
            top: '50px'
          }
        });
  
        // Update displayedChannel or selectedChannel with the new snapshotUpdatedAt

      } else {
        console.error(`Failed to take snapshot: ${await response.json()}`);
      }
    } catch (error) {
      console.error('Error taking snapshot:', error);
    } finally {
      setIsUpdating(false);
    }
  };

 
  const getButtonStyle = (disabled: boolean, darkMode: boolean): string =>
    disabled
      ? "bg-gray-400 cursor-not-allowed"
      : darkMode
      ? "bg-gradient-to-r from-[#D6ED07] to-[#25A906] hover:from-[#C0DA05] hover:to-[#1C8B05]"
      : "bg-gradient-to-r from-[#D6ED07] to-[#25A906] hover:from-[#C0DA05] hover:to-[#1C8B05]";
  
  

// Updated animation variants
const containerVariants: Variants = {
hidden: { opacity: 0 },
visible: {
opacity: 1,
transition: {
  when: "beforeChildren",
  staggerChildren: 0.2, // Increased delay between children
  delayChildren: 0.3,   // Initial delay before starting children animations
  duration: 0.5
}
}
};

const itemVariants: Variants = {
hidden: { 
opacity: 0,
y: 20,
scale: 0.95
},
visible: {
opacity: 1,
y: 0,
scale: 1,
transition: {
  type: "spring",
  damping: 12,
  stiffness: 100,
  duration: 0.5
}
}
};





const StatCard: React.FC<{
  icon: JSX.Element;
  title: string;
  value: string | number;
  darkMode: boolean;
}> = ({ icon, title, value, darkMode }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
    key={title}
    className={`p-2 rounded-lg flex items-center justify-center transition-transform shadow-sm duration-300 
      ${darkMode ? uiTheme.darkUI : uiTheme.lightUI} 
      max-w-[180px] h-full hover:scale-110`}
    style={{ minHeight: "80px" }} 
  >
    <div className="mr-4">{icon}</div>
    <div className="flex flex-col justify-center items-center">
      <h2 className="text-sm font-semibold text-gray-600">{title}</h2>
      <p className={`text-sm ${typeof value === 'number' && value < 0 ? 'text-red-500' : 'text-gray-400'}`}>
        {value}
      </p>
    </div>
  </motion.div>
);


useEffect(() => {

  
  if (!snapshotData || typeof snapshotData !== "object") return;
  const channelSnapshots = displayedChannel.channelId && Array.isArray(snapshotData[displayedChannel.channelId])
  ? snapshotData[displayedChannel.channelId]
  : [];

  if (!Array.isArray(channelSnapshots) || channelSnapshots.length === 0) return;

  // Sort snapshots safely
  channelSnapshots.sort((a, b) =>
    new Date(a.takenAt || a.updatedAt).getTime() - new Date(b.takenAt || b.updatedAt).getTime()
  );

  // Get first and last snapshots
  const firstSnapshot = channelSnapshots[0];
  const lastSnapshot = channelSnapshots[channelSnapshots.length - 1];

  const gainedSubscribers = (lastSnapshot?.subscriberCount || 0) - (firstSnapshot?.subscriberCount || 0);
  const gainedVideos = (lastSnapshot?.videoCount || 0) - (firstSnapshot?.videoCount || 0);
  const gainedViews = (lastSnapshot?.viewCount || 0) - (firstSnapshot?.viewCount || 0);

setGainedViews(gainedViews);
setGainedSubs(gainedSubscribers);
setVideoMade(gainedVideos)

}, [displayedChannel, snapshotData]);


  return (
    <div
      className={`${
        darkMode ? uiTheme.darkUiLight : uiTheme.lightUILight
      } flex-1 p-6 rounded`}
      
    >
      {/* Header Buttons */}
      {isUpdating ? 'I am updating....' : 
      
     (
      <> 
      <div className={`grid grid-cols-2 md:grid-cols-3 md:gap-4 text-sm mb-6 ${showMessage ? 'hidden' : ''}`}>
        {["INSIGHTS", "CHANNEL REPORT"].map((label, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(label)}
            className={`${
              darkMode
                ? uiTheme.darkUI : uiTheme.lightUILight
            
            }  px-4 py-2 w-full md:w-44 rounded transition-transform duration-300 hover:scale-105`}
          >
            {label}
          </button>
        ))}
 

        <div className="flex justify-end border">
          <button
            onClick={() => handleButtonClick("EXPORT")} // Updated to use string value
            className={`${
              darkMode
                ? uiTheme.darkUI : uiTheme.lightUILight
            }  px-4 py-2 rounded flex items-center justify-center transition-transform duration-300 hover:scale-105`}
          >
            Export <SystemUpdateAltIcon fontSize="small" className="ml-1" />
          </button>
        </div>
      </div>

      {/* SEO Growth Insights */}
      
      <section
      className= {`${
        darkMode ? uiTheme.darkUiLight : uiTheme.lightUILight
      }`}
      >
<div className="grid grid-cols-1 md:grid-cols-2 items-center">
<div className={`flex w-[60%] p-4 rounded-lg ${darkMode ? uiTheme.darkUiLight : uiTheme.lightUILight} custom-light-border `}>
<div  className="flex flex-row">
  <img src={displayedChannel.profile} alt={displayedChannel.title} className="mr-2 w-16 h-16 rounded-md shadow-md" />
<div className="flex flex-col">
<h2 className="text-xl font-semibold">{displayedChannel.title} <span className="text-sm text-gray-500 font-semibold">({displayedChannel.country ? displayedChannel.country :'-'})</span></h2>
<p className="text-sm">{displayedChannel.handle}</p>
<p className="text-xs"><label className="text-xs">{displayedChannel.privacyStatus}</label></p>
</div>
</div>      
  </div>
        
         <div  className="flex flex-col align-end">
         <div className="flex flex-col items-end justify-end">


         <button
  className={`px-4 py-2 rounded ${getButtonStyle(channelUpdated, darkMode)}`}
  onClick={() => handleSnapshot(displayedChannel?.channelId, userData?.id)}
  disabled={channelUpdated} 
>
  {channelUpdated ? "Updated" : "Update"}
</button>

<p className="text-sm">
  {!channelUpdated
    ? `Last Update: ${convertDate(displayedChannel.snapshotUpdatedAt)}`
    : ""}
</p>
          </div>
          
           </div>

        </div>
       
      </section>

      {/* Stats Section */}
      <section
  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-2 mt-2 ${
    darkMode ? "backdrop-blur-md" : ""
  }`}
>
  {[
     { label: "SUBS", value: displayedChannel.subs? formatNumber(displayedChannel.subs):formatNumber(displayedChannel.subscriberCount), icon:<PeopleIcon sx={{ color: "#2196f3" }} />},
     { label: "VIEWS", value: displayedChannel.views?formatNumber(displayedChannel.views):formatNumber(displayedChannel.viewCount), icon:<PlayCircleIcon sx={{ color: "#3f51b5" }} /> },
    { label: "VIDEOS", value: displayedChannel.videos? formatNumber(displayedChannel.videos): formatNumber(displayedChannel.videoCount), icon:<OndemandVideoIcon sx={{ color: "#ff5722" }}/> },
    { label: "Gained SUBS", value: formatNumber(gainedSubs), icon:<PeopleIcon sx={{ color: "#ff9800" }} /> },
    { label: "VIDEO Made", value: formatNumber(videoMade), icon:<MovieIcon sx={{ color: "#4caf50" }} /> },
    { label: "Gained VIEWS", value: formatNumber(gainedViews), icon:<VisibilityIcon sx={{ color: "#9c27b0" }} /> },
   ].map((item, index) => (

  <StatCard
  icon={item.icon}
  title={item.label}
  key={index}
  value={item.value}
/>
  ))}
</section>


      {/* Chart Placeholder */}
      <div
        className={`mt-6 p-6 h-120 rounded-lg grid grid-cols-1 md:grid-cols-2 transition-transform duration-300 hover:scale-y-105 gap-4 ${
          darkMode ? uiTheme.darkUI : uiTheme.lightUI
        }`}
      >
        <div className="border rounded-lg bg-gray-100">
          <D3BarChart channel={displayedChannel} field={'latestVideos'} darkMode={darkMode} />
        </div>
        <div className="border rounded-lg bg-gray-100">
        <D3BarChart channel={displayedChannel} field={'topVideos'} />
        </div>
      </div>
      <div
        className={`mt-6 p-6 h-120 rounded-lg grid grid-cols-1 md:grid-cols-2 transition-transform duration-300 hover:scale-y-105 gap-4 ${
          darkMode ? uiTheme.darkUI : uiTheme.lightUI
        }`}
      >
      <GrowthLineChart 
  snapshots={snapshotData} 
  channel={displayedChannel.channelId}
  metric="views" // or "subscribers" or "videos"
/>

<GrowthLineChart 
  snapshots={snapshotData} 
  channel={displayedChannel.channelId}
  metric="subscribers" // or "subscribers" or "videos"
/>
</div>

      {/* Earnings vs Loss Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Channel Stats</h3>
          <div className="grid grid-cols-2 gap-6">
            {["VIDEOS", "SUBS", "LIKES", "COMMENTS"].map((label, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex flex-col items-center transition-transform duration-300 ${
                  darkMode ? uiTheme.darkUI : uiTheme.lightUI  
                } hover:scale-105`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r from-[#D6ED07] to-[#25A906] flex items-center justify-center text-white mb-2 ${
                  darkMode ? uiTheme.darkUI : uiTheme.lightUI  }`} >
                  {label[0]}
                </div>
                <p className="text-base font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>



        <div className="flex flex-col items-center p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Earn vs Loss</h3>
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#D6ED07] to-[#25A906] hover:from-[#C0DA05] hover:to-[#1C8B05]
           flex items-center justify-center text-white">
            {/* Placeholder for Pie Chart */}
          </div>
          <p className="mt-4">
            Av. Revenue: <span className="font-bold">$40.234</span>
          </p>
          <p>
            Loss: <span className="font-bold text-red-500">$140.234</span>
          </p>
          <p>
            Real Revenue: <span className="font-bold">$40.234</span>
          </p>
        </div>
      </div>
      </>
      )
      
      }
 <ToastContainer /> 
    </div>

  );
};

export default MainContent;
