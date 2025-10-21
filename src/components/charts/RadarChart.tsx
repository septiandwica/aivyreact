import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { memo } from "react";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type Props = { labels: string[]; values: number[]; title?: string };

function RadarChartBase({ labels, values, title = "Profile" }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "rgba(75,192,192,1)",
      },
    ],
  };
  const options = {
    responsive: true,
    scales: { r: { beginAtZero: true, max: 100 } },
  };
  return <Radar data={data} options={options} />;
}

export default memo(RadarChartBase);
