const express = require('express');
const app = express();
const port = 9000;

app.get('/', async (req, res) => {
  const timezone = 'Asia/Shanghai';

  try {
    const dashboardResponse = await fetch('https://bd.bangbang93.com/openbmclapi/metric/dashboard');
    const dashboardData = await dashboardResponse.json();

    const sponsorResponse = await fetch('https://bmclapi2.bangbang93.com/openbmclapi/sponsor');
    const sponsorData = await sponsorResponse.json();
    const genTime = new Date().toLocaleString('zh-CN', { timeZone: timezone });
    const load = (dashboardData.load * 100).toFixed(2);
    const curNodes = dashboardData.currentNodes;
    const curBandwidth = dashboardData.currentBandwidth.toFixed(2);
    const todayData = (dashboardData.bytes / 1099511627776).toFixed(2);
    const todayHit = dashboardData.hits;
    const sponsorUrl = sponsorData.link;

    const xml = `
<Grid>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="1*" />
        <ColumnDefinition Width="1*" />
    </Grid.ColumnDefinitions>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
        <RowDefinition Height="Auto" />
        <RowDefinition Height="35" />
    </Grid.RowDefinitions>

    <local:MyCard Title="OpenBMCLAPI DashBoard on PCL2" Margin="0,0,0,5" Grid.Row="0" Grid.Column="0" Grid.ColumnSpan="2">
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
            <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                <Run Text="${load}" FontSize="26"/>
                %
            </TextBlock>
            <TextBlock Margin="0,0,0,4" HorizontalAlignment="Center" TextWrapping="Wrap">
                （此处数据超过 100% 是正常现象）
            </TextBlock>
        </StackPanel>
    </local:MyCard>

    <local:MyButton Margin="2,0,0,0" Grid.Row="4" Grid.Column="1" ColorType="Highlight" Text="查看赞助商信息" EventType="打开网页" EventData="${sponsorUrl}" ToolTip="查看来自 OpenBMCLAPI 赞助商的广告"/>

    <local:MyButton Margin="0,0,2,0" Grid.Row="4" Grid.Column="0" Text="刷新" EventType="刷新主页" ToolTip="重新加载数据，请勿频繁点击"/>
</Grid>
    `;

    res.set('Content-Type', 'application/xml');
    // 发送 XML
    res.send(xml);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching data.');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});