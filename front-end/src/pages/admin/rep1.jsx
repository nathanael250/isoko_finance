import React, { useEffect, useState, useRef } from "react";
import getThemeClasses from '../Shared/UiTheme';
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";

interface Video {
    title: string;
    viewCount: number;
    videoId: string;
    publishedAt: string;
    description: string;
    thumbnailUrl: string;
}

interface Channel {
    latestVideos: Video[];
    topVideos: Video[];
}

interface D3BarChartProps {
    channel: Channel;
    field: string;
    darkMode: boolean;
    onBarClick?: (videoData: Video) => void;
}

const D3BarChart: React.FC<D3BarChartProps> = ({ channel, field, onBarClick, darkMode }) => {
    const containerRef = useRef < HTMLDivElement | null > (null);
    const svgRef = useRef < SVGSVGElement | null > (null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const uiTheme = getThemeClasses(darkMode);
    const navigate = useNavigate();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: Math.max(350, window.innerHeight * 0.45)
                });
            }
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!dimensions.width) return;

        let videos = field === "latestVideos" ? channel.latestVideos || [] : channel.topVideos || [];
        const chartTitle = field === "latestVideos" ? '10 Latest Videos' : '10 Top Videos';

        const titles = videos.map((video) => video.title);
        const viewCounts = videos.map((video) => video.viewCount);

        const totalSubscribers = channel.subscriberCount || channel.subs || 0;; // Replace with actual subscriber count from the channel data
        const targetViews = totalSubscribers * 0.2; // 14% of total subscribers

        const videosAboveThreshold = videos.filter(video => video.viewCount >= targetViews).length;

        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = dimensions.width;
        const height = dimensions.height;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll("*").remove();



        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height * 1.08)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        if (videos.length <= 1) {
            // Display "Not enough data" message

            svg.append("text")
                .attr("x", width / 2 - margin.left)
                .attr("y", height / 2 - margin.top)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .attr("font-weight", "normal")
                .attr("fill", "gray")
                .text("Not enough data to show");
            return;
        }


        const xScale = d3
            .scaleBand()
            .domain(titles)
            .range([0, innerWidth])
            .padding(0.2);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max([...viewCounts, targetViews])])
            .nice()
            .range([innerHeight, 0]);



        const formatNumber = (num: number) => {
            if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
            return num.toString();
        };

        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "rgba(255, 255, 255, 0.95)")
            .style("border", "1px solid #ddd")
            .style("padding", "8px")
            .style("font-size", "12px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("max-width", "200px")
            .style("word-wrap", "break-word");

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)")
            .attr("font-size", `${Math.max(8, Math.min(10, width / 80))}px`)
            .text(d => d.length > 30 ? d.substring(0, 15) + '...' : d);

        // Y Axis
        svg.append("g")
            .call(d3.axisLeft(yScale)
                .tickFormat(d => formatNumber(d as number)))
            .selectAll("text")
            .style("color", "#7CB9E8")
            .attr("font-size", `${Math.max(8, Math.min(10, width / 80))}px`);

        // Bars
        svg.selectAll(".bar")
            .data(videos)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.title) || 0)
            .attr("y", d => yScale(d.viewCount))
            .attr("width", xScale.bandwidth())
            .attr("height", d => innerHeight - yScale(d.viewCount))
            .attr("fill", uiTheme.lightUIlightBlue) // color here
            .style("cursor", "pointer")
            .attr("z-index", "0")
            .attr("rx", 2)
            .attr("ry", 2)
            .on("click", (event, d) => {
                // Navigate to the "video" route with the video ID as state
                navigate(`/Dashboard/video`, { state: { video: d } });
            })

            .on("mouseover", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", uiTheme.lightUIBlue);

                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                const publishDate = new Date(d.publishedAt).toLocaleDateString();

                tooltip.html(`
        <div  style="color:${uiTheme.mainColor}">
          <img src=${d.thumbnailUrl} style="width: 100%;" />
          <strong>${d.title}</strong><br/>
          <p style="color: #666;"><span style="font-weight: bold;">Views:</span> ${d.viewCount.toLocaleString()}</p>
          <p style="color: #666;"><span style="font-weight: bold;">Published:</span> ${publishDate}</p>
          <small style="color: #888;">Click for details</small>
          </div>
        `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", uiTheme.lightUIlightBlue);

                tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add the target views horizontal line
        svg.append("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", yScale(targetViews))
            .attr("y2", yScale(targetViews))
            .attr("stroke", "green")
            .style("position", "absolute")
            .attr("z-index", "1000")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4");

        // Add a label for the target views line
        svg.append("text")
            .attr("x", innerWidth - 10)
            .attr("y", yScale(targetViews) - 5)
            .attr("text-anchor", "end")
            .attr("font-size", "12px")
            .attr("z-index", "1000")
            .attr("fill", "green")
            .text(`Target Views (${Number(targetViews.toFixed(0)).toLocaleString()})`);

        // Display the count of videos hitting the target as a fraction
        svg.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", margin.top + (innerWidth / 10))
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", videosAboveThreshold >= (videos.length / 2) ? "green" : "red")
            .text(`${videosAboveThreshold}/${videos.length}`);


        // Chart Title
        svg.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", `${Math.max(12, Math.min(16, width / 50))}px`)
            .attr("font-weight", "bold")
            .text(chartTitle);

        // X Axis Label
        svg.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom + 25)
            .attr("text-anchor", "middle")
            .attr("font-size", `${Math.max(10, Math.min(12, width / 60))}px`)
            .text("Video Titles");

        // Y Axis Label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -innerHeight / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", `${Math.max(10, Math.min(12, width / 60))}px`)
            .text("Views");

        // Add grid lines
        svg.append("g")
            .attr("class", "grid")
            .style("color", "#7CB9E8")
            .call(d3.axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickFormat(() => ""))
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.3);

        return () => {
            tooltip.remove();
        };
    }, [channel, field, dimensions, onBarClick]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%', background: darkMode ? uiTheme.mainColor : "#F3F4F6" }}></svg>
        </div>
    );
};

export default D3BarChart;