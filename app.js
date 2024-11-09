const express = require('express');
const app = express();
const port = 9000;

// handle
async function handleRequest(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const userAgent = request.headers['user-agent'] || '';
  
    if (!userAgent.startsWith('PCL2/')) {
      response.redirect('https://github.com/Mxmilu666/cloudflare-pcl-bmclapi', 302);
      return false;
    }
  
    if (url.pathname === '/version') {
      response.status(404).send('');
      return false;
    }
  
    return true;
  }

// 转换字节
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let index = 0;

    while (bytes >= 1024 && index < units.length - 1) {
        bytes /= 1024;
        index++;
    }

    return `${bytes.toFixed(2)} ${units[index]}`;
}

// 转换请求
function formatRequests(requests) {
    const units = ['', '万', '百万', '千万', '亿'];
    let index = 0;

    while (requests >= 10000 && index < units.length - 1) {
        requests /= 10000;
        index++;
    }

    return `${requests.toFixed(2)}${units[index]}`;
}
app.get('/', async (req, res) => {
  const shouldContinue = await handleRequest(req, res);
  if (!shouldContinue) return;
  
  const timezone = 'Asia/Shanghai';

  try {
    const dashboardResponse = await fetch('https://bd.bangbang93.com/openbmclapi/metric/dashboard');
    const dashboardData = await dashboardResponse.json();

    const rankResponse = await fetch('https://bd.bangbang93.com/openbmclapi/metric/rank');
    const rankData = await rankResponse.json();

    const rankcard = rankData.slice(0, 5).map((entry, index) => {
        const name = entry.name;
        const bytes = formatBytes(entry.metric.bytes);
        const hits =  formatRequests(entry.metric.hits);
        const sponsorurl = `https://bd.bangbang93.com/pages/rank/sponsor/${entry._id}?type=cluster`;
        return `
        <local:MyListItem  
            Margin="-5,2,-5,8"
            Title="#${index + 1} ${name}" 
            Info="当日流量：${bytes} 当日请求数：${hits}"
            EventType="打开网页" 
            EventData="${sponsorurl}" 
            Type="Clickable" />
        `;
      }).join('\n');

    const genTime = new Date().toLocaleString('zh-CN', { timeZone: timezone });
    const load = (dashboardData.load * 100).toFixed(2);
    const curNodes = dashboardData.currentNodes;
    const curBandwidth = dashboardData.currentBandwidth.toFixed(2);
    const todayData = (dashboardData.bytes / 1099511627776).toFixed(2);
    const todayHit = dashboardData.hits;

    const xml = `
<Grid>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="0.8*" />
        <ColumnDefinition Width="1*" />
    </Grid.ColumnDefinitions>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
    </Grid.RowDefinitions>

    <local:MyCard Title="OpenBMCLAPI DashBoard" Margin="0,0,0,5" Grid.Row="0" Grid.Column="0" Grid.ColumnSpan="2">
        <TextBlock Margin="25,12,20,10" HorizontalAlignment="Right">
            ${genTime} (UTC+8)
        </TextBlock>
    </local:MyCard>

    <local:MyCard Title="在线节点" Margin="0,0,2,4" Grid.Row="1" Grid.Column="0">
        <StackPanel Margin="25,40,23,15">
            <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                <Run Text="${curNodes}" FontSize="26"/>
                个
            </TextBlock>
        </StackPanel>
    </local:MyCard>

    <local:MyCard Title="出网带宽" Margin="2,0,0,4" Grid.Row="1" Grid.Column="1">
        <StackPanel Margin="25,40,23,15">
            <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                <Run Text="${curBandwidth}" FontSize="26"/>
                Mbps
            </TextBlock>
        </StackPanel>
    </local:MyCard>

    <local:MyCard Title="今日流量" Margin="0,0,2,4" Grid.Row="2" Grid.Column="0">
        <StackPanel Margin="25,40,23,15">
            <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                <Run Text="${todayData}" FontSize="26"/>
                TiB
            </TextBlock>
        </StackPanel>
    </local:MyCard>

    <local:MyCard Title="今日请求数" Margin="2,0,0,4" Grid.Row="2" Grid.Column="1">
        <StackPanel Margin="25,40,23,15">
            <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                <Run Text="${todayHit}" FontSize="26"/>
                次
            </TextBlock>
        </StackPanel>
    </local:MyCard>

     <local:MyCard Title="主控负载" Margin="0,0,0,4" Grid.Row="3" Grid.Column="0" Grid.ColumnSpan="2">
        <StackPanel Margin="25,40,23,15">
            <StackPanel Margin="0,0,0,4">
                <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                    <Run Text="${load}" FontSize="26"/> %
                </TextBlock>
                <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                    （此处数据超过 100% 是正常现象）
                </TextBlock>
            </StackPanel>
            <StackPanel Margin="0,4,0,0" Orientation="Horizontal" HorizontalAlignment="Center">
                <local:MyButton Margin="4,0,0,0" Width="180" Height="35" ColorType="Highlight" Text="查看详细负载信息" EventType="打开网页" EventData="https://bd.bangbang93.com" ToolTip="查看 OpenBMCLAPI 的详细负载信息" />
                <Grid Width="5"/>
                <local:MyButton Margin="0,0,4,0" Width="180" Height="35" Text="刷新" EventType="刷新主页" ToolTip="重新加载数据，请勿频繁点击" />
            </StackPanel>
        </StackPanel>
    </local:MyCard>

    <local:MyCard Title="节点排行榜" CanSwap="True" Margin="0,0,0,4" Grid.Row="4" Grid.Column="0" Grid.ColumnSpan="2">
        <StackPanel Margin="25,40,23,15">
        <local:MyHint 
            Margin="-5,2,-5,8" 
            IsWarn="False"
            Text="当前只展示节点排行榜前五名" />
        ${rankcard}
        </StackPanel>
    </local:MyCard>

</Grid>
    `;

    // 发送 XML
    res.send(xml);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching data.');
  }
});

app.listen(port, () => {
  console.log(`pcl-bmclapi-homepage app listening at http://localhost:${port}`);
  console.log(`Powered with love by Silverteal & Mxmilu666`);
});